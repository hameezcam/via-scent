import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");
  const orderId = searchParams.get("orderId");

  if (orderNumber) {
    const order = await orderService.getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  }

  if (orderId) {
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  }

  const orders = await orderService.getAllOrders();
  return NextResponse.json(orders);
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const adminUser = req.headers.get("x-admin-user") || "admin@viascent.lk";
    const { orderId, action, status, note, receiptNumber } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required." }, { status: 400 });
    }

    if (action === "record_payment") {
      const updated = await orderService.recordPaymentCollection(orderId, adminUser, { receiptNumber, notes: note });
      return NextResponse.json({ success: true, order: updated, message: "Payment collection recorded." });
    }

    if (status) {
      const updated = await orderService.updateOrderStatus(orderId, status, adminUser, note);
      return NextResponse.json({ success: true, order: updated, message: `Status updated to ${status}.` });
    }

    return NextResponse.json({ error: "No valid action specified." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
