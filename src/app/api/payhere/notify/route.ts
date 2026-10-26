import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";
import { notifyOrderPlaced } from "@/services/order-email.service";
import { afterResponse } from "@/lib/after-response";
import { PAYHERE_STATUS, formatPayHereAmount, getPayHereConfig, verifyNotification } from "@/lib/payhere";

/**
 * PayHere calls this after every payment attempt (server to server).
 * We trust nothing in it until the signature checks out, and we only mark an
 * order paid when the amount and currency match what we asked PayHere to charge.
 */
export async function POST(req: NextRequest) {
  const config = getPayHereConfig();
  if (!config) {
    return NextResponse.json({ error: "Card payments are not set up." }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid notification." }, { status: 400 });
  }
  const field = (name: string) => String(form.get(name) ?? "");

  const merchantId = field("merchant_id");
  const orderNumber = field("order_id");
  const amount = field("payhere_amount");
  const currency = field("payhere_currency");
  const statusCode = field("status_code");

  const signatureOk = verifyNotification(config, {
    merchantId,
    orderId: orderNumber,
    amount,
    currency,
    statusCode,
    signature: field("md5sig"),
  });
  if (!signatureOk || merchantId !== config.merchantId) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const order = await orderService.getOrderByNumber(orderNumber);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const status = Number(statusCode);
  if (status === PAYHERE_STATUS.SUCCESS) {
    const expectedAmount = formatPayHereAmount(order.pricingSnapshot.totalLKR);
    if (currency !== "LKR" || Number(amount).toFixed(2) !== expectedAmount) {
      return NextResponse.json({ error: "Amount does not match the order." }, { status: 400 });
    }
  }

  const result = await orderService.applyPayHereNotification(orderNumber, {
    statusCode: status,
    paymentId: field("payment_id") || undefined,
  });
  if (!result.success) {
    return NextResponse.json({ error: result.message ?? "Could not record payment." }, { status: 400 });
  }

  const paidOrder = result.order;
  if (result.newlyPaid && paidOrder) {
    afterResponse(() => notifyOrderPlaced(paidOrder));
  }

  return new NextResponse("OK");
}
