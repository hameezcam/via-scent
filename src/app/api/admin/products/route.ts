import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { productService } from "@/services/product.service";
import { settingsService } from "@/services/settings.service";

export const dynamic = "force-dynamic";

function purgeStorefrontCache(slug?: string) {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/", "page");
    revalidatePath("/shop", "page");
    revalidatePath("/shop/[category]", "page");
    revalidatePath("/home-fragrance", "page");
    revalidatePath("/business-scenting", "page");
    if (slug) {
      revalidatePath(`/products/${slug}`, "page");
    }
  } catch {
    // Fallback if revalidatePath is called in unsupported context
  }
}

export async function GET() {
  const products = await productService.getAllAdmin();
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const adminUser = req.headers.get("x-admin-user") || "admin@viascent.lk";

    if (body.action === "import" && Array.isArray(body.products)) {
      const count = await productService.importCatalogue(body.products, adminUser);
      settingsService.addAuditLog({
        category: "CATALOGUE",
        action: "IMPORT_CATALOGUE",
        performedBy: adminUser,
        details: `Imported ${count} products into master catalogue`,
      });
      purgeStorefrontCache();
      return NextResponse.json({ success: true, count, message: `Imported ${count} products.` });
    }

    const newProduct = await productService.createProduct(body, adminUser);
    settingsService.addAuditLog({
      category: "CATALOGUE",
      action: "CREATE_PRODUCT",
      performedBy: adminUser,
      details: `Created new product ${newProduct.name} (${newProduct.sku})`,
      newValue: newProduct,
    });
    purgeStorefrontCache(newProduct.slug);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const adminUser = req.headers.get("x-admin-user") || "admin@viascent.lk";
    const { id, updates, action } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    if (action === "toggle_publish") {
      const updated = await productService.togglePublishStatus(id, adminUser);
      settingsService.addAuditLog({
        category: "CATALOGUE",
        action: updated.isPublished ? "PUBLISH_PRODUCT" : "UNPUBLISH_PRODUCT",
        performedBy: adminUser,
        details: `${updated.isPublished ? "Published" : "Unpublished"} product ${updated.name} (${updated.sku})`,
        newValue: { isPublished: updated.isPublished },
      });
      purgeStorefrontCache(updated.slug);
      return NextResponse.json({ success: true, product: updated });
    }

    if (action === "archive") {
      const updated = await productService.archiveProduct(id, adminUser);
      settingsService.addAuditLog({
        category: "CATALOGUE",
        action: "ARCHIVE_PRODUCT",
        performedBy: adminUser,
        details: `Archived product ${updated.name} (${updated.sku})`,
        newValue: { isArchived: true, isPublished: false },
      });
      purgeStorefrontCache(updated.slug);
      return NextResponse.json({ success: true, product: updated });
    }

    if (action === "delete") {
      const existing = await productService.getById(id);
      await productService.deleteProduct(id, adminUser);
      settingsService.addAuditLog({
        category: "CATALOGUE",
        action: "DELETE_PRODUCT",
        performedBy: adminUser,
        details: `Permanently deleted product "${existing?.name || id}" (${existing?.sku || ""}) from catalogue.`,
        previousValue: existing || { id },
      });
      purgeStorefrontCache(existing?.slug);
      return NextResponse.json({ success: true, message: "Product deleted." });
    }

    const updated = await productService.updateProduct(id, updates, adminUser);
    settingsService.addAuditLog({
      category: "CATALOGUE",
      action: "UPDATE_PRODUCT",
      performedBy: adminUser,
      details: `Updated product ${updated.name} (${updated.sku})`,
      newValue: updates,
    });
    purgeStorefrontCache(updated.slug);
    return NextResponse.json({ success: true, product: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminUser = req.headers.get("x-admin-user") || "admin@viascent.lk";
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // Fallback
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Product ID is required for deletion." }, { status: 400 });
    }

    const existing = await productService.getById(id);
    await productService.deleteProduct(id, adminUser);

    settingsService.addAuditLog({
      category: "CATALOGUE",
      action: "DELETE_PRODUCT",
      performedBy: adminUser,
      details: `Permanently deleted product "${existing?.name || id}" (${existing?.sku || ""}) from catalogue.`,
      previousValue: existing || { id },
    });

    purgeStorefrontCache(existing?.slug);

    return NextResponse.json({
      success: true,
      message: `Product "${existing?.name || id}" successfully deleted.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
