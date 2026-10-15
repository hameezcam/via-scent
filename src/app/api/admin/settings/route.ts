import { NextRequest, NextResponse } from "next/server";
import { settingsService } from "@/services/settings.service";

export async function GET() {
  const settings = settingsService.getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const adminUser = req.headers.get("x-admin-user") || "admin@viascent.lk";
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json({ error: "Section and data payload are required." }, { status: 400 });
    }

    let updatedSettings;

    switch (section) {
      case "delivery":
        updatedSettings = settingsService.updateDeliverySettings(data, adminUser);
        break;
      case "payments":
        updatedSettings = settingsService.updatePaymentSettings(data, adminUser);
        break;
      case "returns":
        updatedSettings = settingsService.updateReturnSettings(data, adminUser);
        break;
      case "warranty":
        updatedSettings = settingsService.updateWarrantySettings(data, adminUser);
        break;
      default:
        return NextResponse.json({ error: `Unknown settings section: ${section}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: `Settings for ${section} updated and logged to audit trail.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
