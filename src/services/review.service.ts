import { createDocumentStore } from "@/lib/document-store";
import { getOrderAlertEmail, sendEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";
import { productService } from "./product.service";
import { orderService } from "./order.service";
import type { ProductReview, PublicReview, ReviewStatus, ReviewSummary } from "@/types/review";

export interface SubmitReviewInput {
  productId: string;
  rating: number;
  title?: string;
  body: string;
  authorName: string;
  authorEmail?: string;
  city?: string;
  orderNumber?: string;
}

const reviewStore = createDocumentStore<ProductReview>({
  collection: "reviews",
  fileName: "reviews.json",
  getId: (review) => review.id,
});

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";

function toPublic(review: ProductReview): PublicReview {
  const { id, rating, title, body, authorName, city, verifiedPurchase, createdAt } = review;
  return { id, rating, title, body, authorName, city, verifiedPurchase, createdAt };
}

export function summarize(reviews: Pick<ProductReview, "rating">[]): ReviewSummary {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return { average: Math.round((total / reviews.length) * 10) / 10, count: reviews.length };
}

class ReviewService {
  /** New reviews wait for approval in the admin before they appear on the site. */
  async submitReview(input: SubmitReviewInput): Promise<{ success: true; review: ProductReview } | { success: false; error: string }> {
    const rating = Math.round(Number(input.rating));
    const body = clean(input.body, 2000);
    const authorName = clean(input.authorName, 60);
    const authorEmail = clean(input.authorEmail, 120).toLowerCase();

    if (!(rating >= 1 && rating <= 5)) return { success: false, error: "Please choose a star rating." };
    if (body.length < 10) return { success: false, error: "Please write a few words about the product." };
    if (!authorName) return { success: false, error: "Please add your name." };
    if (authorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
      return { success: false, error: "Please check your email address." };
    }

    const product = await productService.getById(clean(input.productId, 120));
    if (!product || product.isPublished === false || product.isArchived) {
      return { success: false, error: "We couldn't find that product." };
    }

    // A matching order number + email + product marks the review as a verified purchase
    let verifiedPurchase = false;
    const orderNumber = clean(input.orderNumber, 40).toUpperCase();
    if (orderNumber && authorEmail) {
      const order = await orderService.getOrderByNumber(orderNumber);
      verifiedPurchase = Boolean(
        order &&
          order.customer.email.trim().toLowerCase() === authorEmail &&
          order.items.some((item) => item.productId === product.id)
      );
    }

    const review: ProductReview = {
      id: `rev-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name.trim(),
      rating: rating as ProductReview["rating"],
      title: clean(input.title, 100) || undefined,
      body,
      authorName,
      authorEmail: authorEmail || undefined,
      city: clean(input.city, 60) || undefined,
      verifiedPurchase,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await reviewStore.put(review.id, review);
    return { success: true, review };
  }

  async getAll(): Promise<ProductReview[]> {
    return reviewStore.list();
  }

  async getApprovedForProduct(productId: string): Promise<{ reviews: PublicReview[]; summary: ReviewSummary }> {
    const approved = (await reviewStore.list()).filter((r) => r.productId === productId && r.status === "approved");
    return { reviews: approved.map(toPublic), summary: summarize(approved) };
  }

  async setStatus(id: string, status: ReviewStatus, adminUser: string): Promise<ProductReview> {
    const review = await reviewStore.get(id);
    if (!review) throw new Error("Review not found.");
    const updated: ProductReview = { ...review, status, moderatedAt: new Date().toISOString(), moderatedBy: adminUser };
    await reviewStore.put(id, updated);
    return updated;
  }

  /** Lets the store know a review is waiting for approval. */
  async notifyNewReview(review: ProductReview): Promise<void> {
    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
    const adminUrl = `${getSiteUrl()}/admin/reviews`;
    await sendEmail({
      to: getOrderAlertEmail(),
      subject: `New ${review.rating}-star review for ${review.productName}`,
      text: `${review.authorName} left a review for ${review.productName}.\n\n${stars}\n${review.title ? `${review.title}\n` : ""}${review.body}\n\nApprove or reject it in the admin: ${adminUrl}`,
      html: `<p>${escape(review.authorName)} left a review for <strong>${escape(review.productName)}</strong>.</p><p style="font-size:18px;color:#B49A70;">${stars}</p>${review.title ? `<p><strong>${escape(review.title)}</strong></p>` : ""}<p>${escape(review.body)}</p><p><a href="${adminUrl}">Approve or reject it in the admin</a></p>`,
    });
  }
}

function escape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export const reviewService = new ReviewService();
