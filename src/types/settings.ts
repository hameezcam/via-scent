/**
 * VIA Scent Store Settings & Configuration Types
 */

export interface DeliverySettings {
  islandwideEnabled: boolean;
  defaultCourierFeeLKR: number; // Defaults to 500
  districtFees: Record<string, number>; // Optional district overrides (e.g. Colombo: 400, Jaffna: 650)
  freeDeliveryThresholdLKR: number | null; // e.g. Free shipping above Rs. 50,000
  policyText: string;
  estimateText: string;
}

export interface PaymentSettings {
  codEnabled: boolean; // Cash on delivery (enabled by default)
  onlineGatewayEnabled: boolean; // Digital card payments
  defaultMethod: "cod" | "online_gateway";
  activeGateway: "payhere" | "commercial_bank" | "mock_gateway";
  merchantIdPlaceholder: string;
}

export interface ReturnSettings {
  returnWindowDays: number; // Default 7 days
  refundWindowDays: number; // Default 7 days
  policyText: string;
  requiresInspection: boolean;
  allowDamagedExchange: boolean;
}

export interface WarrantySettings {
  defaultDurationMonths: number; // Default 6 months
  termsText: string;
  coveredItems: string[];
  excludedItems: string[];
}

export interface StoreSettings {
  brand: {
    brandName: string;
    brandShortName: string;
    franchiseStatement: string;
    contactEmail: string;
    contactPhone: string;
    contactWhatsApp: string;
    showroomAddress: string;
    operatingHours: string;
  };
  delivery: DeliverySettings;
  payments: PaymentSettings;
  returns: ReturnSettings;
  warranty: WarrantySettings;
  seoDefaults: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  category: "DELIVERY" | "PAYMENTS" | "RETURNS" | "WARRANTY" | "BRAND" | "ORDERS" | "CATALOGUE";
  action: string;
  performedBy: string; // e.g. "admin@viascent.lk"
  details: string;
  previousValue?: unknown;
  newValue?: unknown;
}
