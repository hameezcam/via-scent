import { NextRequest, NextResponse } from "next/server";
import { orderService, CreateOrderInput } from "@/services/order.service";
import { settingsService } from "@/services/settings.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { customer, items, paymentMethod } = body;

    if (!customer || !customer.fullName || !customer.email || !customer.phone || !customer.addressLine1 || !customer.city) {
      return NextResponse.json(
        { error: "Missing mandatory customer delivery details." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty. Please add items to checkout." },
        { status: 400 }
      );
    }

    // Verify payment method availability against active settings
    const settings = settingsService.getSettings().payments;
    if (paymentMethod === "cod" && !settings.codEnabled) {
      return NextResponse.json(
        { error: "Cash on Delivery is currently disabled in store settings." },
        { status: 400 }
      );
    }

    if (paymentMethod === "online_gateway" && !settings.onlineGatewayEnabled) {
      return NextResponse.json(
        { error: "Online digital payments are currently disabled in store settings." },
        { status: 400 }
      );
    }

    const orderInput: CreateOrderInput = {
      customer,
      items,
      paymentMethod: paymentMethod === "online_gateway" ? "online_gateway" : "cod",
      notes: customer.notes,
    };

    const newOrder = orderService.createOrder(orderInput);

    // Prepare response based on payment method
    if (newOrder.payment.method === "online_gateway") {
      // Generate secure gateway payment intent token (for PayHere / IPG integration)
      const mockSignature = `sig_${Date.now()}_${Buffer.from(newOrder.orderNumber).toString("base64")}`;
      return NextResponse.json({
        success: true,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        pricingSnapshot: newOrder.pricingSnapshot,
        paymentType: "online_gateway",
        paymentDetails: {
          gateway: "payhere_sri_lanka",
          merchantId: settings.merchantIdPlaceholder,
          amountLKR: newOrder.pricingSnapshot.totalLKR,
          currency: "LKR",
          signature: mockSignature,
          redirectUrl: `/checkout/online-simulation?orderId=${newOrder.id}&sig=${mockSignature}`,
        },
      });
    }

    // For Cash on Delivery
    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      pricingSnapshot: newOrder.pricingSnapshot,
      paymentType: "cod",
      status: newOrder.status,
      message: "Order placed successfully with Cash on Delivery. Order status is Unpaid pending courier delivery.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
