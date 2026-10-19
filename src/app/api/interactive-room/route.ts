import { NextResponse } from "next/server";
import { interactiveRoomService } from "@/services/interactive-room.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await interactiveRoomService.getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("[API/interactive-room] Error fetching config:", error);
    return NextResponse.json({ error: "Failed to load interactive room config" }, { status: 500 });
  }
}
