import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";
import { notifyOrderPlaced } from "@/services/order-email.service";
import { afterResponse } from "@/lib/after-response";
import { getKokoConfig, verifyKokoResponse } from "@/lib/koko";

/**
 * Koko calls this after a payment attempt (server to server).
 * We trust nothing in it until Koko's signature checks out.
 */
export async function POST(req: NextRequest) {
  const config = getKokoConfig();
  if (!config) {
    return NextResponse.json({ error: "Koko payments are not set up." }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid notification." }, { status: 400 });
  }
  const field = (name: string) => String(form.get(name) ?? "");

  const orderNumber = field("orderId");
  const transactionId = field("trnId");
  const status = field("status");

  if (!verifyKokoResponse(config, { orderId: orderNumber, trnId: transactionId, status, signature: field("signature") })) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const result = await orderService.applyKokoNotification(orderNumber, { status, transactionId });
  if (!result.success) {
    return NextResponse.json({ error: result.message ?? "Could not record payment." }, { status: 400 });
  }

  const paidOrder = result.order;
  if (result.newlyPaid && paidOrder) {
    afterResponse(() => notifyOrderPlaced(paidOrder));
  }

  return new NextResponse("OK");
}
