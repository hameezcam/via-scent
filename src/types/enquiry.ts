/**
 * B2B Commercial Scenting Enquiry Type Definitions
 */

export type IndustryType =
  | "hospitality"
  | "corporate"
  | "retail"
  | "wellness-spa"
  | "dining-nightlife"
  | "healthcare"
  | "real-estate"
  | "other";

export type SpaceSizeType =
  | "compact" // Under 500 sq.ft
  | "medium" // 500 - 2,500 sq.ft
  | "large" // 2,500 - 10,000 sq.ft
  | "hvac-enterprise"; // 10,000+ sq.ft or Centralized AHU/HVAC

export type PreferredContactMethod = "phone" | "whatsapp" | "email" | "site-visit";

export interface B2BQuoteRequest {
  fullName: string;
  companyName: string;
  businessEmail: string;
  phoneNumber: string;
  industry: IndustryType | "";
  cityDistrict: string;
  spaceSize: SpaceSizeType | "";
  servicesOfInterest: string[];
  requirementsDescription: string;
  preferredContact: PreferredContactMethod;
  privacyConsent: boolean;
}

export interface B2BFormState {
  status: "idle" | "submitting" | "success" | "error";
  errors: Partial<Record<keyof B2BQuoteRequest, string>>;
  submittedData?: B2BQuoteRequest;
  message?: string;
}
