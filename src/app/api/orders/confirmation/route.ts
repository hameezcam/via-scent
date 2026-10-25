import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";
import { safeEqual } from "@/lib/admin-auth";

/**
 * Customer-facing order lookup for the confirmation page.
 * Requires the order's private confirmation token, which only the browser
 * that placed the order receives.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");
  const token = searchParams.get("token");

  if (!orderNumber || !token) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = await orderService.getOrderByNumber(orderNumber);
  if (!order || !order.confirmationToken || !safeEqual(order.confirmationToken, token)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { history, confirmationToken, ...publicOrder } = order;
  return NextResponse.json(publicOrder);
}
