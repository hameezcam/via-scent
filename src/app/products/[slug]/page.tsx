import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { productService } from "@/services/product.service";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { PRODUCTS } from "@/data/products";
import { BRAND_CONFIG, formatProductPrice, isPriceOnRequest } from "@/config/brand.config";
import { getSiteUrl } from "@/lib/site-url";
import { withServedImages, withServedImagesAll } from "@/lib/product-images";
import { reviewService } from "@/services/review.service";
import type { PublicReview, ReviewSummary } from "@/types/review";
import type { Product } from "@/types/product";

// Inline data: URLs are too large for share previews and structured data;
// withServedImages swaps admin uploads for the image route first
function publicImages(product: Product): string[] {
  return product.images.filter((src) => src && !src.startsWith("data:"));
}

function productJsonLd(product: Product, reviews: PublicReview[], summary: ReviewSummary) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/products/${product.slug}`;
  const images = publicImages(product).map((src) => (src.startsWith("http") ? src : `${siteUrl}${src}`));
  const price = product.variants[0]?.priceLKR ?? product.basePriceLKR;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.tagline,
    sku: product.sku,
    image: images,
    url,
    brand: { "@type": "Brand", name: "Dr. Scent" },
    ...(summary.count > 0
      ? {
          aggregateRating: { "@type": "AggregateRating", ratingValue: summary.average, reviewCount: summary.count },
          review: reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            author: { "@type": "Person", name: r.authorName },
            datePublished: r.createdAt.slice(0, 10),
            reviewBody: r.body,
          })),
        }
      : {}),
    ...(isPriceOnRequest(price)
      ? {}
      : {
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "LKR",
            price,
            availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: BRAND_CONFIG.brandName },
          },
        }),
  };
}

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    // The root layout template appends the brand name
    title: `${product.name} | ${product.categoryName}`,
    description: isPriceOnRequest(product.basePriceLKR)
      ? `${product.tagline} Available in Sri Lanka by quotation. Authorized Dr. Scent Franchise Supply.`
      : `${product.tagline} Available in Sri Lanka for ${formatProductPrice(product.basePriceLKR)}. Authorized Dr. Scent Franchise Supply.`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} - ${BRAND_CONFIG.brandName}`,
      description: product.shortDescription,
      images: publicImages(withServedImages(product))
        .slice(0, 1)
        .map((url) => ({ url, width: 1000, height: 1000, alt: product.name })),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const stored = await productService.getBySlug(slug);

  if (!stored) {
    notFound();
  }

  const product = withServedImages(stored);
  const [related, { reviews, summary }] = await Promise.all([
    productService.getRelated(product.id, 4),
    reviewService.getApprovedForProduct(product.id),
  ]);
  const relatedProducts = withServedImagesAll(related);

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so product text can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, reviews, summary)).replace(/</g, "\\u003c") }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} reviews={reviews} reviewSummary={summary} />
    </>
  );
}
