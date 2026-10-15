import fs from "fs";
import path from "path";
import { StoreSettings, DeliverySettings, PaymentSettings, ReturnSettings, WarrantySettings, AuditLogEntry } from "../types/settings";

const SETTINGS_FILE_PATH = path.join(process.cwd(), "src/data/store-settings.json");
const AUDIT_FILE_PATH = path.join(process.cwd(), "src/data/audit-log.json");

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
    onlineGatewayEnabled: true, // Enabled by default
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

class SettingsService {
  private inMemorySettings: StoreSettings | null = null;
  private inMemoryAuditLogs: AuditLogEntry[] | null = null;

  public getSettings(): StoreSettings {
    if (this.inMemorySettings) {
      return this.inMemorySettings;
    }

    try {
      if (fs.existsSync(SETTINGS_FILE_PATH)) {
        const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        this.inMemorySettings = {
          ...DEFAULT_STORE_SETTINGS,
          ...parsed,
          delivery: { ...DEFAULT_STORE_SETTINGS.delivery, ...parsed.delivery },
          payments: { ...DEFAULT_STORE_SETTINGS.payments, ...parsed.payments },
          returns: { ...DEFAULT_STORE_SETTINGS.returns, ...parsed.returns },
          warranty: { ...DEFAULT_STORE_SETTINGS.warranty, ...parsed.warranty },
        };
        return this.inMemorySettings!;
      }
    } catch {
      // Fallback to default
    }

    this.inMemorySettings = { ...DEFAULT_STORE_SETTINGS };
    return this.inMemorySettings;
  }

  public getDeliveryFee(district?: string): number {
    const settings = this.getSettings().delivery;
    if (!settings.islandwideEnabled) {
      return settings.defaultCourierFeeLKR;
    }
    if (district && settings.districtFees[district] !== undefined) {
      return settings.districtFees[district];
    }
    return settings.defaultCourierFeeLKR; // Default LKR 500
  }

  public updateDeliverySettings(updates: Partial<DeliverySettings>, adminUser: string = "system_admin"): StoreSettings {
    const current = this.getSettings();
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

    this.saveSettings(newSettings);
    this.addAuditLog({
      category: "DELIVERY",
      action: "UPDATE_DELIVERY_SETTINGS",
      performedBy: adminUser,
      details: `Delivery fee updated from LKR ${prevDelivery.defaultCourierFeeLKR} to LKR ${newDelivery.defaultCourierFeeLKR}. Islandwide status: ${newDelivery.islandwideEnabled}.`,
      previousValue: prevDelivery,
      newValue: newDelivery,
    });

    return newSettings;
  }

  public updatePaymentSettings(updates: Partial<PaymentSettings>, adminUser: string = "system_admin"): StoreSettings {
    const current = this.getSettings();
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

    this.saveSettings(newSettings);
    this.addAuditLog({
      category: "PAYMENTS",
      action: "UPDATE_PAYMENT_SETTINGS",
      performedBy: adminUser,
      details: `Payment methods updated. COD Enabled: ${newPayments.codEnabled}, Online Gateway Enabled: ${newPayments.onlineGatewayEnabled}.`,
      previousValue: prevPayments,
      newValue: newPayments,
    });

    return newSettings;
  }

  public updateReturnSettings(updates: Partial<ReturnSettings>, adminUser: string = "system_admin"): StoreSettings {
    const current = this.getSettings();
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

    this.saveSettings(newSettings);
    this.addAuditLog({
      category: "RETURNS",
      action: "UPDATE_RETURN_SETTINGS",
      performedBy: adminUser,
      details: `Return policy adjusted to ${newReturns.returnWindowDays}-day return / ${newReturns.refundWindowDays}-day refund.`,
      previousValue: prevReturns,
      newValue: newReturns,
    });

    return newSettings;
  }

  public updateWarrantySettings(updates: Partial<WarrantySettings>, adminUser: string = "system_admin"): StoreSettings {
    const current = this.getSettings();
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

    this.saveSettings(newSettings);
    this.addAuditLog({
      category: "WARRANTY",
      action: "UPDATE_WARRANTY_SETTINGS",
      performedBy: adminUser,
      details: `Default warranty duration adjusted to ${newWarranty.defaultDurationMonths} months.`,
      previousValue: prevWarranty,
      newValue: newWarranty,
    });

    return newSettings;
  }

  public getAuditLogs(): AuditLogEntry[] {
    if (this.inMemoryAuditLogs) {
      return this.inMemoryAuditLogs;
    }

    try {
      if (fs.existsSync(AUDIT_FILE_PATH)) {
        const raw = fs.readFileSync(AUDIT_FILE_PATH, "utf-8");
        this.inMemoryAuditLogs = JSON.parse(raw);
        return this.inMemoryAuditLogs!;
      }
    } catch {
      // Ignore
    }

    this.inMemoryAuditLogs = [];
    return this.inMemoryAuditLogs;
  }

  public addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    logs.unshift(newEntry);
    this.inMemoryAuditLogs = logs.slice(0, 500); // Retain latest 500 logs

    try {
      const dir = path.dirname(AUDIT_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(AUDIT_FILE_PATH, JSON.stringify(this.inMemoryAuditLogs, null, 2), "utf-8");
    } catch {
      // In-memory fallback
    }
  }

  private saveSettings(settings: StoreSettings) {
    this.inMemorySettings = settings;
    try {
      const dir = path.dirname(SETTINGS_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), "utf-8");
    } catch {
      // In-memory fallback
    }
  }
}

export const settingsService = new SettingsService();
