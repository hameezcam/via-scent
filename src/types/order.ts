import { ProductCategory } from "./product";

export type PaymentMethod = "cod" | "online_gateway";

export type OrderStatus =
  | "pending_payment"
  | "placed_cod"
  | "confirmed"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  category: ProductCategory;
  unitPriceLKR: number;
  quantity: number;
  lineTotalLKR: number;
  image: string;
}

export interface PricingSnapshot {
  merchandiseSubtotalLKR: number;
  deliveryFeeLKR: number; // Stored snapshot at time of checkout!
  discountLKR: number;
  taxLKR: number;
  totalLKR: number;
}

export interface PaymentRecord {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  receiptNumber?: string;
  gateway?: string;
  paidAt?: string;
  collectedAt?: string;
  collectedBy?: string; // For COD verification
  failureReason?: string;
}

export interface OrderHistoryEntry {
  timestamp: string;
  status: OrderStatus;
  note: string;
  updatedBy: string;
}

export interface Order {
  id: string; // e.g. "ord-883921"
  orderNumber: string; // e.g. "VIA-20261014-9901"
  createdAt: string;
  customer: CustomerDetails;
  items: OrderItem[];
  pricingSnapshot: PricingSnapshot;
  payment: PaymentRecord;
  status: OrderStatus;
  history: OrderHistoryEntry[];
  /** Secret shared only with the customer's browser, used to view their own confirmation page. */
  confirmationToken?: string;
}

export type ReturnStatus =
  | "REQUESTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "RETURN_IN_TRANSIT"
  | "RECEIVED"
  | "REFUND_PENDING"
  | "REFUNDED";

export interface ReturnRequest {
  id: string;
  returnNumber: string; // e.g. "RET-2026-1001"
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemSku: string;
  itemName: string;
  reason: string;
  details: string;
  submittedAt: string;
  orderDate: string;
  isWithin7Days: boolean;
  status: ReturnStatus;
  refundMethod: "original_gateway" | "bank_transfer_cod";
  refundAmountLKR?: number;
  assessmentNotes?: string;
  history: {
    timestamp: string;
    status: ReturnStatus;
    note: string;
    updatedBy: string;
  }[];
}

export type WarrantyClaimStatus =
  | "SUBMITTED"
  | "UNDER_EVALUATION"
  | "APPROVED_REPAIR"
  | "APPROVED_REPLACEMENT"
  | "REJECTED";

export interface WarrantyClaim {
  id: string;
  claimNumber: string; // e.g. "WAR-2026-0501"
  orderNumber: string;
  productSku: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  purchaseDate: string;
  warrantyDurationMonths: number;
  reportedIssue: string;
  evidenceNotes: string;
  submittedAt: string;
  status: WarrantyClaimStatus;
  resolutionNotes?: string;
  isUnderWarranty?: boolean;
  serialNumber?: string;
  issueDescription?: string;
  history: {
    timestamp: string;
    status: WarrantyClaimStatus;
    note: string;
    updatedBy: string;
  }[];
}
