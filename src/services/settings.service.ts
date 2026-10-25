import { StoreSettings, DeliverySettings, PaymentSettings, ReturnSettings, WarrantySettings, AuditLogEntry } from "../types/settings";
import { createDocumentStore } from "@/lib/document-store";

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  brand: {
    brandName: "VIA Scent",
    brandShortName: "VIA Scent",
    franchiseStatement: "Authorized Franchisee Partner for Dr. Scent in Sri Lanka",
    contactEmail: "concierge@viascent.lk",
    contactPhone: "+94 11 234 5678",
    contactWhatsApp: "+94 77 123 4567",
    showroomAddress: "VIA Scent Boutique, Level 3, One Galle Face / Crescat Boulevard, Colombo 03, Sri Lanka",
    operatingHours: "Monday – Saturday: 10:00 AM – 7:30 PM | Sunday: 11:00 AM – 5:00 PM",
  },
  delivery: {
    islandwideEnabled: true,
    defaultCourierFeeLKR: 500, // Explicitly default 500 LKR
    districtFees: {},
    freeDeliveryThresholdLKR: null, // e.g. Free shipping above LKR 40,000 when configured
    policyText: "Standard islandwide delivery throughout Sri Lanka is charged at a flat rate of LKR 500 per order. All deliveries are tracked and dispatched via verified express couriers.",
    estimateText: "Colombo & suburbs: 1-2 business days. Outstation & regional provinces: 2-4 business days.",
  },
  payments: {
    codEnabled: true, // Enabled by default
    onlineGatewayEnabled: false, // Off until a live PayHere integration is connected
    defaultMethod: "cod",
    activeGateway: "payhere",
    merchantIdPlaceholder: "VIA_SCENT_MERCHANT_10928",
  },
  returns: {
    returnWindowDays: 7, // Default 7-day return window
    refundWindowDays: 7, // Default 7-day refund policy
    policyText: "Customers may initiate a return within 7 calendar days of delivery. Returned items must be unused, in original packaging with seals intact. For damaged or defective arrivals, replacements are dispatched free of charge within 48 hours.",
    requiresInspection: true,
    allowDamagedExchange: true,
  },
  warranty: {
    defaultDurationMonths: 6, // Default 6 months advertised warranty
    termsText: "All Dr. Scent aroma diffusers sold by VIA Scent come with a 6-month official franchisee warranty covering internal pump performance and electrical defects under normal residential or commercial usage.",
    coveredItems: [
      "Internal air pump mechanical failure",
      "Touch screen and PCB electronic controller malfunction",
      "Factory wiring and USB-C power connection issues",
    ],
    excludedItems: [
      "Physical impact or drop damage to glass/ceramic housing",
      "Contamination or clogging from non-Dr. Scent diluted oils or water usage in waterless nebulizers",
      "Unauthorized disassembly by non-VIA Scent technicians",
    ],
  },
  seoDefaults: {
    metaTitle: "VIA Scent | Authorized Dr. Scent Franchisee Sri Lanka",
    metaDescription: "Experience luxury architectural scenting and cold-air diffusers by Dr. Scent across Sri Lanka. Retail boutique and commercial B2B scenting.",
  },
};

const SETTINGS_DOC_ID = "store";

type StoredSettings = StoreSettings & { id: string };

const settingsStore = createDocumentStore<StoredSettings>({
  collection: "settings",
  fileName: "settings.json",
  getId: (doc) => doc.id,
});

const auditStore = createDocumentStore<AuditLogEntry>({
  collection: "audit",
  fileName: "audit-log.json",
  getId: (entry) => entry.id,
});

/**
 * Online card payments currently run through a simulated gateway page.
 * They stay unavailable to customers unless ENABLE_SIMULATED_PAYMENTS=true
 * (local testing only) until a real PayHere integration replaces the mock.
 */
export function isSimulatedPaymentAllowed(): boolean {
  return process.env.ENABLE_SIMULATED_PAYMENTS === "true";
}

class SettingsService {
  public async getSettings(): Promise<StoreSettings> {
    const stored = await settingsStore.get(SETTINGS_DOC_ID);
    if (!stored) {
      return { ...DEFAULT_STORE_SETTINGS };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...parsed } = stored;
    return {
      ...DEFAULT_STORE_SETTINGS,
      ...parsed,
      brand: { ...DEFAULT_STORE_SETTINGS.brand, ...parsed.brand },
      delivery: { ...DEFAULT_STORE_SETTINGS.delivery, ...parsed.delivery },
      payments: { ...DEFAULT_STORE_SETTINGS.payments, ...parsed.payments },
      returns: { ...DEFAULT_STORE_SETTINGS.returns, ...parsed.returns },
      warranty: { ...DEFAULT_STORE_SETTINGS.warranty, ...parsed.warranty },
    };
  }

  /** Payment settings as customers actually experience them. */
  public async getEffectivePaymentSettings(): Promise<PaymentSettings> {
    const payments = (await this.getSettings()).payments;
    return {
      ...payments,
      onlineGatewayEnabled: payments.onlineGatewayEnabled && isSimulatedPaymentAllowed(),
    };
  }

  public async getDeliveryFee(district?: string): Promise<number> {
    const settings = (await this.getSettings()).delivery;
    if (!settings.islandwideEnabled) {
      return settings.defaultCourierFeeLKR;
    }
    if (district && settings.districtFees[district] !== undefined) {
      return settings.districtFees[district];
    }
    return settings.defaultCourierFeeLKR; // Default LKR 500
  }

  public async updateDeliverySettings(updates: Partial<DeliverySettings>, adminUser: string = "system_admin"): Promise<StoreSettings> {
    const current = await this.getSettings();
    const prevDelivery = { ...current.delivery };

    const newDelivery: DeliverySettings = {
      ...current.delivery,
      ...updates,
      defaultCourierFeeLKR:
        updates.defaultCourierFeeLKR !== undefined && !isNaN(Number(updates.defaultCourierFeeLKR))
          ? Math.max(0, Number(updates.defaultCourierFeeLKR))
          : current.delivery.defaultCourierFeeLKR,
    };

    const newSettings: StoreSettings = {
      ...current,
      delivery: newDelivery,
    };

    await this.saveSettings(newSettings);
    await this.addAuditLog({
      category: "DELIVERY",
      action: "UPDATE_DELIVERY_SETTINGS",
      performedBy: adminUser,
      details: `Delivery fee updated from LKR ${prevDelivery.defaultCourierFeeLKR} to LKR ${newDelivery.defaultCourierFeeLKR}. Islandwide status: ${newDelivery.islandwideEnabled}.`,
      previousValue: prevDelivery,
      newValue: newDelivery,
    });

    return newSettings;
  }

  public async updatePaymentSettings(updates: Partial<PaymentSettings>, adminUser: string = "system_admin"): Promise<StoreSettings> {
    const current = await this.getSettings();
    const prevPayments = { ...current.payments };

    const newPayments: PaymentSettings = {
      ...current.payments,
      ...updates,
      // COD remains enabled unless explicitly set
      codEnabled: updates.codEnabled !== undefined ? Boolean(updates.codEnabled) : current.payments.codEnabled,
    };

    const newSettings: StoreSettings = {
      ...current,
      payments: newPayments,
    };

    await this.saveSettings(newSettings);
    await this.addAuditLog({
      category: "PAYMENTS",
      action: "UPDATE_PAYMENT_SETTINGS",
      performedBy: adminUser,
      details: `Payment methods updated. COD Enabled: ${newPayments.codEnabled}, Online Gateway Enabled: ${newPayments.onlineGatewayEnabled}.`,
      previousValue: prevPayments,
      newValue: newPayments,
    });

    return newSettings;
  }

  public async updateReturnSettings(updates: Partial<ReturnSettings>, adminUser: string = "system_admin"): Promise<StoreSettings> {
    const current = await this.getSettings();
    const prevReturns = { ...current.returns };

    const newReturns: ReturnSettings = {
      ...current.returns,
      ...updates,
      returnWindowDays: updates.returnWindowDays !== undefined ? Math.max(1, Number(updates.returnWindowDays)) : current.returns.returnWindowDays,
      refundWindowDays: updates.refundWindowDays !== undefined ? Math.max(1, Number(updates.refundWindowDays)) : current.returns.refundWindowDays,
    };

    const newSettings: StoreSettings = {
      ...current,
      returns: newReturns,
    };

    await this.saveSettings(newSettings);
    await this.addAuditLog({
      category: "RETURNS",
      action: "UPDATE_RETURN_SETTINGS",
      performedBy: adminUser,
      details: `Return policy adjusted to ${newReturns.returnWindowDays}-day return / ${newReturns.refundWindowDays}-day refund.`,
      previousValue: prevReturns,
      newValue: newReturns,
    });

    return newSettings;
  }

  public async updateWarrantySettings(updates: Partial<WarrantySettings>, adminUser: string = "system_admin"): Promise<StoreSettings> {
    const current = await this.getSettings();
    const prevWarranty = { ...current.warranty };

    const newWarranty: WarrantySettings = {
      ...current.warranty,
      ...updates,
      defaultDurationMonths: updates.defaultDurationMonths !== undefined ? Math.max(1, Number(updates.defaultDurationMonths)) : current.warranty.defaultDurationMonths,
    };

    const newSettings: StoreSettings = {
      ...current,
      warranty: newWarranty,
    };

    await this.saveSettings(newSettings);
    await this.addAuditLog({
      category: "WARRANTY",
      action: "UPDATE_WARRANTY_SETTINGS",
      performedBy: adminUser,
      details: `Default warranty duration adjusted to ${newWarranty.defaultDurationMonths} months.`,
      previousValue: prevWarranty,
      newValue: newWarranty,
    });

    return newSettings;
  }

  public async getAuditLogs(): Promise<AuditLogEntry[]> {
    return auditStore.list({ limit: 500 }); // Latest 500 logs
  }

  public async addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<void> {
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    try {
      await auditStore.put(newEntry.id, newEntry);
    } catch (err) {
      // Audit logging must never block the primary admin action
      console.error("[Audit] Failed to record audit entry:", err);
    }
  }

  private async saveSettings(settings: StoreSettings): Promise<void> {
    await settingsStore.put(SETTINGS_DOC_ID, { ...settings, id: SETTINGS_DOC_ID });
  }
}

export const settingsService = new SettingsService();
