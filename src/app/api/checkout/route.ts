import { NextRequest, NextResponse, after } from "next/server";
import { orderService, CreateOrderInput } from "@/services/order.service";
import { settingsService } from "@/services/settings.service";
import { notifyOrderPlaced } from "@/services/order-email.service";
import { buildCheckoutForm, getPayHereConfig } from "@/lib/payhere";
import { buildKokoCheckoutForm, getKokoConfig } from "@/lib/koko";
import { getSiteUrl } from "@/lib/site-url";
import { validateReceiptUpload } from "@/lib/bank-receipt";

/** Runs work after the response is sent. Outside a request (for example in tests) it just runs it. */
function afterResponse(task: () => Promise<void>) {
  try {
    after(task);
  } catch {
    void task().catch(() => {});
  }
}

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

    if (paymentMethod === "koko" && !settings.kokoEnabled) {
      return NextResponse.json(
        { error: "Koko instalments are not available right now." },
        { status: 400 }
      );
    }

    if (paymentMethod === "bank_transfer" && !settings.bankTransferEnabled) {
      return NextResponse.json(
        { error: "Bank transfer is not available right now." },
        { status: 400 }
      );
    }

    let receipt;
    if (paymentMethod === "bank_transfer") {
      try {
        receipt = validateReceiptUpload(body.receipt);
      } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid receipt." }, { status: 400 });
      }
    }

    const isOnline = paymentMethod === "online_gateway" || paymentMethod === "koko";
    const orderInput: CreateOrderInput = {
      customer,
      items,
      paymentMethod: paymentMethod === "bank_transfer" ? "bank_transfer" : isOnline ? "online_gateway" : "cod",
      receipt,
      onlineGateway: paymentMethod === "koko" ? "koko" : "payhere",
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
    if (newOrder.payment.gateway === "koko") {
      const koko = getKokoConfig();
      if (!koko) {
        return NextResponse.json({ error: "Koko instalments are not available right now." }, { status: 503 });
      }
      // The browser posts this signed form to Koko's hosted page
      return NextResponse.json({
        success: true,
        order: orderRef,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        pricingSnapshot: newOrder.pricingSnapshot,
        paymentType: "koko",
        koko: buildKokoCheckoutForm(
          koko,
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

    // Bank transfer: the store checks the receipt against its bank account before confirming
    if (newOrder.payment.method === "bank_transfer") {
      afterResponse(() => notifyOrderPlaced(newOrder));
      return NextResponse.json({
        success: true,
        order: orderRef,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        pricingSnapshot: newOrder.pricingSnapshot,
        paymentType: "bank_transfer",
        status: newOrder.status,
        message: "Order received. We'll confirm it once we've checked your bank transfer.",
      });
    }

    // For Cash on Delivery. Online orders are announced once payment is verified.
    afterResponse(() => notifyOrderPlaced(newOrder));
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
