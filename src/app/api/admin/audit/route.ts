import { NextResponse } from "next/server";
import { settingsService } from "@/services/settings.service";

export async function GET() {
  try {
    const logs = settingsService.getAuditLogs();
    return NextResponse.json({ success: true, logs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load audit logs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
