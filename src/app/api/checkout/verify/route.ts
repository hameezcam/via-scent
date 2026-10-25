import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";
import { isSimulatedPaymentAllowed } from "@/services/settings.service";

export async function POST(req: NextRequest) {
  // The only gateway today is a simulation: refuse to mark orders paid
  // unless simulated payments are explicitly enabled for local testing.
  if (!isSimulatedPaymentAllowed()) {
    return NextResponse.json(
      { error: "Online card payments are not available yet. Please choose Cash on Delivery." },
      { status: 403 }
    );
  }

  try {
    const { orderId, transactionId, signature } = await req.json();

    if (!orderId || !transactionId || !signature) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters." },
        { status: 400 }
      );
    }

    const verificationResult = await orderService.verifyOnlinePayment(orderId, transactionId, signature);

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.message || "Payment verification failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: verificationResult.order,
      message: "Payment successfully verified and recorded server-side.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment verification server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
