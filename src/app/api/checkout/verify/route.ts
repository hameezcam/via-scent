import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";

export async function POST(req: NextRequest) {
  try {
    const { orderId, transactionId, signature } = await req.json();

    if (!orderId || !transactionId || !signature) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters." },
        { status: 400 }
      );
    }

    const verificationResult = orderService.verifyOnlinePayment(orderId, transactionId, signature);

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
