import fs from "fs";
import path from "path";
import { WarrantyClaim, WarrantyClaimStatus } from "../types/order";
import { settingsService } from "./settings.service";

const WARRANTY_FILE_PATH = path.join(process.cwd(), "src/data/warranty.json");

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

class WarrantyService {
  private inMemoryClaims: WarrantyClaim[] | null = null;

  public submitClaim(input: SubmitWarrantyInput): WarrantyClaim {
    const defaultDuration = settingsService.getSettings().warranty.defaultDurationMonths;
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

    const claims = this.getAllClaims();
    claims.unshift(newClaim);
    this.saveClaims(claims);

    return newClaim;
  }

  public updateClaimStatus(
    claimId: string,
    newStatus: WarrantyClaimStatus,
    adminUser: string,
    resolutionNotes?: string
  ): WarrantyClaim {
    const claims = this.getAllClaims();
    const item = claims.find((c) => c.id === claimId);
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

    this.saveClaims(claims);
    return item;
  }

  public getAllClaims(): WarrantyClaim[] {
    if (this.inMemoryClaims) {
      return this.inMemoryClaims;
    }

    try {
      if (fs.existsSync(WARRANTY_FILE_PATH)) {
        const raw = fs.readFileSync(WARRANTY_FILE_PATH, "utf-8");
        this.inMemoryClaims = JSON.parse(raw);
        return this.inMemoryClaims!;
      }
    } catch {
      // Fallback
    }

    // Seed initial demo warranty claim
    this.inMemoryClaims = [
      {
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
      },
    ];

    return this.inMemoryClaims;
  }

  private saveClaims(claims: WarrantyClaim[]) {
    this.inMemoryClaims = claims;
    try {
      const dir = path.dirname(WARRANTY_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(WARRANTY_FILE_PATH, JSON.stringify(claims, null, 2), "utf-8");
    } catch {
      // In-memory fallback
    }
  }
}

export const warrantyService = new WarrantyService();
