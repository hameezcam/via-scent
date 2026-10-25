import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { partnerService } from "@/services/partner.service";
import { settingsService } from "@/services/settings.service";

export const dynamic = "force-dynamic";

function purgeHomepageCache() {
  try {
    revalidatePath("/", "page");
    revalidatePath("/", "layout");
    revalidatePath("/admin/partners", "page");
  } catch {
    // ignore in environments where revalidatePath is unavailable
  }
}

export async function GET() {
  try {
    const partners = await partnerService.getAll(false);
    return NextResponse.json(partners);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load partners";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const adminUser = req.headers.get("x-admin-user") || "admin@viascent.lk";

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Partner name is required." }, { status: 400 });
    }
    if (!body.logoUrl || !body.logoUrl.trim()) {
      return NextResponse.json({ error: "Partner logo image or URL is required." }, { status: 400 });
    }

    const partner = await partnerService.create(
      {
        name: body.name,
        logoUrl: body.logoUrl,
        websiteUrl: body.websiteUrl,
        displayOrder: Number(body.displayOrder || 0),
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
      adminUser
    );

    await settingsService.addAuditLog({
      category: "PARTNERS",
      action: "CREATE_PARTNER",
      performedBy: adminUser,
      details: `Added new trusted partner: ${partner.name}`,
      newValue: partner,
    });

    purgeHomepageCache();
    return NextResponse.json({ success: true, partner });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create partner.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const adminUser = req.headers.get("x-admin-user") || "admin@viascent.lk";

    if (body.action === "reorder" && Array.isArray(body.orderedIds)) {
      const updated = await partnerService.reorder(body.orderedIds, adminUser);
      await settingsService.addAuditLog({
        category: "PARTNERS",
        action: "REORDER_PARTNERS",
        performedBy: adminUser,
        details: `Reordered trusted partners sequence (${body.orderedIds.length} partners)`,
      });
      purgeHomepageCache();
      return NextResponse.json({ success: true, partners: updated });
    }

    if (!body.id) {
      return NextResponse.json({ error: "Partner ID is required for updating." }, { status: 400 });
    }

    const existing = await partnerService.getById(body.id);
    const updated = await partnerService.update(body.id, body, adminUser);

    await settingsService.addAuditLog({
      category: "PARTNERS",
      action: "UPDATE_PARTNER",
      performedBy: adminUser,
      details: `Updated partner: ${updated.name}`,
      previousValue: existing,
      newValue: updated,
    });

    purgeHomepageCache();
    return NextResponse.json({ success: true, partner: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update partner.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const adminUser = req.headers.get("x-admin-user") || "admin@viascent.lk";

    if (!id) {
      return NextResponse.json({ error: "Partner ID is required for deletion." }, { status: 400 });
    }

    const existing = await partnerService.getById(id);
    await partnerService.delete(id, adminUser);

    await settingsService.addAuditLog({
      category: "PARTNERS",
      action: "DELETE_PARTNER",
      performedBy: adminUser,
      details: `Deleted partner: ${existing ? existing.name : id}`,
      previousValue: existing,
    });

    purgeHomepageCache();
    return NextResponse.json({ success: true, message: "Partner deleted." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete partner.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
