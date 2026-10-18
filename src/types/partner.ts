/**
 * Trusted Partner Type Definitions
 */

export interface TrustedPartner {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TrustedPartnerInput = Omit<TrustedPartner, "id" | "createdAt" | "updatedAt">;
