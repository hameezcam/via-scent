import { NextResponse } from "next/server";
import { settingsService } from "@/services/settings.service";

export async function GET() {
  const settings = await settingsService.getSettings();
  const payments = await settingsService.getEffectivePaymentSettings();
  return NextResponse.json({
    brand: settings.brand,
    delivery: {
      islandwideEnabled: settings.delivery.islandwideEnabled,
      defaultCourierFeeLKR: settings.delivery.defaultCourierFeeLKR,
      freeDeliveryThresholdLKR: settings.delivery.freeDeliveryThresholdLKR,
      policyText: settings.delivery.policyText,
      estimateText: settings.delivery.estimateText,
    },
    payments: {
      codEnabled: payments.codEnabled,
      onlineGatewayEnabled: payments.onlineGatewayEnabled,
      defaultMethod: payments.onlineGatewayEnabled ? payments.defaultMethod : "cod",
    },
    returns: {
      returnWindowDays: settings.returns.returnWindowDays,
      refundWindowDays: settings.returns.refundWindowDays,
      policyText: settings.returns.policyText,
    },
    warranty: {
      defaultDurationMonths: settings.warranty.defaultDurationMonths,
      termsText: settings.warranty.termsText,
    },
  });
}
