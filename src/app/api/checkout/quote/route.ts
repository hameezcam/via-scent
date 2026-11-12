import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";

export const dynamic = "force-dynamic";

/**
 * The exact amounts an order would be charged right now, worked out from the live catalogue.
 * Checkout shows these so the customer never sees a different total from the one they pay.
 */
export async function POST(req: NextRequest) {
  try {
    const { items, district, paymentMethod } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items." }, { status: 400 });
    }

    const totals = await orderService.calculateCheckoutTotals(
      items.slice(0, 50).map((i: { productId?: string; variantId?: string; quantity?: number }) => ({
        productId: String(i?.productId ?? ""),
        variantId: String(i?.variantId ?? ""),
        quantity: Number(i?.quantity) || 1,
      })),
      typeof district === "string" ? district : undefined,
      { kokoTax: paymentMethod === "koko" }
    );

    return NextResponse.json({
      subtotalLKR: totals.merchandiseSubtotalLKR,
      deliveryFeeLKR: totals.deliveryFeeLKR,
      taxLKR: totals.taxLKR,
      totalLKR: totals.totalLKR,
      lines: totals.validatedItems.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantName: i.variantName,
        quantity: i.quantity,
        unitPriceLKR: i.unitPriceLKR,
        lineTotalLKR: i.lineTotalLKR,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Could not price the order." }, { status: 500 });
  }
}
