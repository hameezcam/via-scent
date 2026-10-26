import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";

const digits = (value: string) => value.replace(/\D/g, "");

/**
 * Lets a customer check their order status with the order number and the
 * phone number they ordered with. Only the status is returned, never personal details.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const orderNumber = typeof body?.orderNumber === "string" ? body.orderNumber.trim().toUpperCase() : "";
  const phone = typeof body?.phone === "string" ? digits(body.phone) : "";
  const notFound = NextResponse.json(
    { error: "We couldn't find an order with those details. Please check them and try again." },
    { status: 404 }
  );

  if (!orderNumber || phone.length < 9) return notFound;

  const order = await orderService.getOrderByNumber(orderNumber);
  // Compare the last 9 digits so +94 77..., 077... and 77... all match
  if (!order || digits(order.customer.phone).slice(-9) !== phone.slice(-9)) return notFound;

  return NextResponse.json({
    orderNumber: order.orderNumber,
    placedAt: order.createdAt,
    status: order.status,
    paymentMethod: order.payment.method,
    paymentStatus: order.payment.status,
    totalLKR: order.pricingSnapshot.totalLKR,
    items: order.items.map((i) => ({ name: i.productName, quantity: i.quantity })),
  });
}
