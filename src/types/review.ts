export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ProductReview {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  body: string;
  authorName: string;
  /** Kept private; used to confirm a purchase and never shown on the site. */
  authorEmail?: string;
  city?: string;
  /** True when the reviewer gave an order number whose email and items match. */
  verifiedPurchase: boolean;
  status: ReviewStatus;
  createdAt: string;
  moderatedAt?: string;
  moderatedBy?: string;
}

/** What the storefront may show: no email, no moderation details. */
export type PublicReview = Pick<
  ProductReview,
  "id" | "rating" | "title" | "body" | "authorName" | "city" | "verifiedPurchase" | "createdAt"
>;

export interface ReviewSummary {
  average: number;
  count: number;
}
