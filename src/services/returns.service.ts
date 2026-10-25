import { ReturnRequest, ReturnStatus } from "../types/order";
import { settingsService } from "./settings.service";
import { orderService } from "./order.service";
import { createDocumentStore } from "@/lib/document-store";

export interface SubmitReturnInput {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemSku: string;
  itemName: string;
  reason: string;
  details: string;
  refundMethod: "original_gateway" | "bank_transfer_cod";
}

// Demo return shown only in local file mode (never seeded into Postgres)
const DEMO_RETURN: ReturnRequest = {
    id: "ret-demo-01",
    returnNumber: "RET-20261014-401",
    orderNumber: "VIA-20261014-1001",
    customerName: "Malik Fernando",
    customerEmail: "malik.f@example.lk",
    customerPhone: "+94 77 123 4567",
    itemSku: "DSC-PORT-GLD",
    itemName: "Dr. Scent Portable Ambient Diffuser (Champagne Gold)",
    reason: "Unopened - Exchange for Obsidian Black Finish",
    details: "Arrived in perfect condition with seals intact. Client requests exchange for black color.",
    submittedAt: new Date("2026-10-14T11:00:00Z").toISOString(),
    orderDate: new Date("2026-10-14T09:30:00Z").toISOString(),
    isWithin7Days: true,
    status: "UNDER_REVIEW",
    refundMethod: "bank_transfer_cod",
    history: [
      {
        timestamp: new Date("2026-10-14T11:00:00Z").toISOString(),
        status: "REQUESTED",
        note: "Customer initiated return within 7-day policy window.",
        updatedBy: "malik.f@example.lk",
      },
      {
        timestamp: new Date("2026-10-14T11:30:00Z").toISOString(),
        status: "UNDER_REVIEW",
        note: "Concierge verified proof of purchase. Reviewing courier collection.",
        updatedBy: "admin@viascent.lk",
      },
    ],
  };

const returnsStore = createDocumentStore<ReturnRequest>({
  collection: "returns",
  fileName: "returns.json",
  getId: (item) => item.id,
  seed: () => [DEMO_RETURN],
});

class ReturnsService {
  public async submitReturn(input: SubmitReturnInput): Promise<{ success: boolean; returnRequest?: ReturnRequest; error?: string }> {
    const order = await orderService.getOrderByNumber(input.orderNumber);
    const returnSettings = (await settingsService.getSettings()).returns;

    let isWithin7Days = true;
    let orderDate = new Date().toISOString();

    if (order) {
      orderDate = order.createdAt;
      const orderTimestamp = new Date(order.createdAt).getTime();
      const currentTimestamp = Date.now();
      const daysPassed = (currentTimestamp - orderTimestamp) / (1000 * 60 * 60 * 24);
      isWithin7Days = daysPassed <= returnSettings.returnWindowDays;
    }

    const returnId = `ret-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const returnNumber = `RET-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`;

    const newReturn: ReturnRequest = {
      id: returnId,
      returnNumber,
      orderNumber: input.orderNumber,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      itemSku: input.itemSku,
      itemName: input.itemName,
      reason: input.reason,
      details: input.details,
      submittedAt: new Date().toISOString(),
      orderDate,
      isWithin7Days,
      status: "REQUESTED",
      refundMethod: input.refundMethod,
      history: [
        {
          timestamp: new Date().toISOString(),
          status: "REQUESTED",
          note: isWithin7Days
            ? "Return request submitted within approved 7-day policy window. Awaiting administrative inspection."
            : "Return request submitted after 7-day standard policy window. Marked for discretionary review.",
          updatedBy: input.customerEmail,
        },
      ],
    };

    await returnsStore.put(newReturn.id, newReturn);

    return { success: true, returnRequest: newReturn };
  }

  public async updateReturnStatus(
    returnId: string,
    newStatus: ReturnStatus,
    adminUser: string,
    notes?: string,
    refundAmountLKR?: number
  ): Promise<ReturnRequest> {
    const item = await returnsStore.get(returnId);
    if (!item) {
      throw new Error("Return request not found.");
    }

    const prevStatus = item.status;
    item.status = newStatus;
    if (notes) item.assessmentNotes = notes;
    if (refundAmountLKR !== undefined) item.refundAmountLKR = refundAmountLKR;

    item.history.push({
      timestamp: new Date().toISOString(),
      status: newStatus,
      note: `Return status transitioned from ${prevStatus} to ${newStatus}. ${notes || ""}`,
      updatedBy: adminUser,
    });

    await returnsStore.put(item.id, item);
    return item;
  }

  public async getAllReturns(): Promise<ReturnRequest[]> {
    return returnsStore.list();
  }

  public async getReturnById(id: string): Promise<ReturnRequest | null> {
    return returnsStore.get(id);
  }
}

export const returnsService = new ReturnsService();
