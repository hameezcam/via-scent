import { WarrantyClaim, WarrantyClaimStatus } from "../types/order";
import { settingsService } from "./settings.service";
import { createDocumentStore } from "@/lib/document-store";

export interface SubmitWarrantyInput {
  orderNumber: string;
  productSku: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  purchaseDate: string;
  reportedIssue: string;
  evidenceNotes: string;
}

// Demo claim shown only in local file mode (never seeded into Postgres)
const DEMO_CLAIM: WarrantyClaim = {
    id: "war-demo-01",
    claimNumber: "WAR-20261014-501",
    orderNumber: "VIA-20261014-1001",
    productSku: "DSC-PORT-GLD",
    productName: "Dr. Scent Portable Ambient Diffuser",
    customerName: "Malik Fernando",
    customerEmail: "malik.f@example.lk",
    customerPhone: "+94 77 123 4567",
    purchaseDate: "2026-10-14",
    warrantyDurationMonths: 6,
    reportedIssue: "Atomizer nozzle stopped dispersing mist after 3 days of vehicle operation.",
    evidenceNotes: "Battery charges normally, motor hums, but dry fragrance mist is blocked.",
    submittedAt: new Date("2026-10-14T12:00:00Z").toISOString(),
    status: "UNDER_EVALUATION",
    resolutionNotes: "Assigned to Colombo hardware workshop for nozzle ultrasonic flush or core replacement.",
    history: [
      {
        timestamp: new Date("2026-10-14T12:00:00Z").toISOString(),
        status: "SUBMITTED",
        note: "Customer registered claim via portal.",
        updatedBy: "malik.f@example.lk",
      },
      {
        timestamp: new Date("2026-10-14T12:45:00Z").toISOString(),
        status: "UNDER_EVALUATION",
        note: "Technician verified 6-month active warranty coverage.",
        updatedBy: "tech@viascent.lk",
      },
    ],
  };

const warrantyStore = createDocumentStore<WarrantyClaim>({
  collection: "warranty",
  fileName: "warranty.json",
  getId: (claim) => claim.id,
  seed: () => [DEMO_CLAIM],
});

class WarrantyService {
  public async submitClaim(input: SubmitWarrantyInput): Promise<WarrantyClaim> {
    const defaultDuration = (await settingsService.getSettings()).warranty.defaultDurationMonths;
    const claimId = `war-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const claimNumber = `WAR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`;

    const newClaim: WarrantyClaim = {
      id: claimId,
      claimNumber,
      orderNumber: input.orderNumber,
      productSku: input.productSku,
      productName: input.productName,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      purchaseDate: input.purchaseDate,
      warrantyDurationMonths: defaultDuration,
      reportedIssue: input.reportedIssue,
      evidenceNotes: input.evidenceNotes,
      submittedAt: new Date().toISOString(),
      status: "SUBMITTED",
      history: [
        {
          timestamp: new Date().toISOString(),
          status: "SUBMITTED",
          note: `Warranty claim logged under ${defaultDuration}-month franchisee coverage. Awaiting technician evaluation.`,
          updatedBy: input.customerEmail,
        },
      ],
    };

    await warrantyStore.put(newClaim.id, newClaim);

    return newClaim;
  }

  public async updateClaimStatus(
    claimId: string,
    newStatus: WarrantyClaimStatus,
    adminUser: string,
    resolutionNotes?: string
  ): Promise<WarrantyClaim> {
    const item = await warrantyStore.get(claimId);
    if (!item) {
      throw new Error("Warranty claim not found.");
    }

    const prevStatus = item.status;
    item.status = newStatus;
    if (resolutionNotes) item.resolutionNotes = resolutionNotes;

    item.history.push({
      timestamp: new Date().toISOString(),
      status: newStatus,
      note: `Warranty evaluation updated from ${prevStatus} to ${newStatus}. ${resolutionNotes || ""}`,
      updatedBy: adminUser,
    });

    await warrantyStore.put(item.id, item);
    return item;
  }

  public async getAllClaims(): Promise<WarrantyClaim[]> {
    return warrantyStore.list();
  }
}

export const warrantyService = new WarrantyService();
