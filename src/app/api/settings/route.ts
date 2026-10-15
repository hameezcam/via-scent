import { NextResponse } from "next/server";
import { settingsService } from "@/services/settings.service";

export async function GET() {
  const settings = settingsService.getSettings();
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
      codEnabled: settings.payments.codEnabled,
      onlineGatewayEnabled: settings.payments.onlineGatewayEnabled,
      defaultMethod: settings.payments.defaultMethod,
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
