import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { productService } from "@/services/product.service";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { PRODUCTS } from "@/data/products";
import { BRAND_CONFIG, formatLKR } from "@/config/brand.config";

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
    title: `${product.name} | ${product.categoryName} | ${BRAND_CONFIG.brandName}`,
    description: `${product.tagline} Available in Sri Lanka for ${formatLKR(product.basePriceLKR)}. Authorized Dr. Scent Franchise Supply.`,
    openGraph: {
      title: `${product.name} - ${BRAND_CONFIG.brandName}`,
      description: product.shortDescription,
      images: [
        {
          url: product.images[0] || "",
          width: 1000,
          height: 1000,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await productService.getRelated(product.id, 3);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
