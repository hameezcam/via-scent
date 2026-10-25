import { NextRequest, NextResponse, after } from "next/server";
import { orderService, CreateOrderInput } from "@/services/order.service";
import { settingsService } from "@/services/settings.service";
import { notifyOrderPlaced } from "@/services/order-email.service";
import { buildCheckoutForm, getPayHereConfig } from "@/lib/payhere";
import { getSiteUrl } from "@/lib/site-url";

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
    const settings = await settingsService.getEffectivePaymentSettings();
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

    const newOrder = await orderService.createOrder(orderInput);

    // Identifies the order to the customer's own browser for the confirmation page
    const orderRef = {
      id: newOrder.id,
      orderNumber: newOrder.orderNumber,
      confirmationToken: newOrder.confirmationToken,
    };

    // Prepare response based on payment method
    if (newOrder.payment.method === "online_gateway") {
      const payhere = getPayHereConfig();
      if (payhere) {
        // Real card payment: the browser posts this signed form to PayHere's hosted page
        return NextResponse.json({
          success: true,
          order: orderRef,
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
          pricingSnapshot: newOrder.pricingSnapshot,
          paymentType: "payhere",
          payhere: buildCheckoutForm(
            payhere,
            {
              orderNumber: newOrder.orderNumber,
              confirmationToken: newOrder.confirmationToken ?? "",
              totalLKR: newOrder.pricingSnapshot.totalLKR,
              customer: newOrder.customer,
            },
            getSiteUrl()
          ),
        });
      }

      // Generate secure gateway payment intent token (for PayHere / IPG integration)
      const mockSignature = `sig_${Date.now()}_${Buffer.from(newOrder.orderNumber).toString("base64")}`;
      return NextResponse.json({
        success: true,
        order: orderRef,
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
          redirectUrl: `/checkout/online-simulation?orderNumber=${newOrder.orderNumber}&token=${newOrder.confirmationToken}`,
        },
      });
    }

    // For Cash on Delivery. Online orders are announced once payment is verified.
    after(() => notifyOrderPlaced(newOrder));
    return NextResponse.json({
      success: true,
      order: orderRef,
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
