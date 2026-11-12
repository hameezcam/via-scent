import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";

export const dynamic = "force-dynamic";

/** Shows the payment slip a customer uploaded for a bank transfer order. Admin only (see proxy.ts). */
export async function GET(req: NextRequest) {
  const orderId = new URL(req.url).searchParams.get("orderId");
  const receipt = orderId ? await orderService.getReceipt(orderId) : null;
  if (!receipt) {
    return NextResponse.json({ error: "No receipt found for this order." }, { status: 404 });
  }

  return new NextResponse(Buffer.from(receipt.dataBase64, "base64"), {
    headers: {
      "Content-Type": receipt.contentType,
      "Content-Disposition": `inline; filename="${receipt.fileName.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
