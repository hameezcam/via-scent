import { Order, OrderItem, CustomerDetails, PaymentMethod, OrderStatus, PaymentStatus, PricingSnapshot } from "../types/order";
import { settingsService } from "./settings.service";
import { productService } from "./product.service";
import { createDocumentStore } from "@/lib/document-store";

export interface CreateOrderInput {
  customer: CustomerDetails;
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
  paymentMethod: PaymentMethod;
  notes?: string;
}

// Demo order shown only in local file mode (never seeded into Postgres)
const DEMO_ORDER: Order = {
  id: "ord-demo-01",
  orderNumber: "VIA-20261014-1001",
  createdAt: new Date("2026-10-14T09:30:00Z").toISOString(),
  customer: {
    fullName: "Malik Fernando",
    email: "malik.f@example.lk",
    phone: "+94 77 123 4567",
    addressLine1: "42 Alfred House Gardens",
    city: "Colombo 03",
    district: "Colombo",
  },
  items: [
    {
      productId: "prod-diff-01",
      productSlug: "dr-scent-luxe-portable-diffuser",
      productName: "Dr. Scent Portable Ambient Diffuser",
      variantId: "var-port-gld",
      variantName: "Champagne Gold",
      sku: "DSC-PORT-GLD",
      category: "aroma-diffusers",
      unitPriceLKR: 29900,
      quantity: 1,
      lineTotalLKR: 29900,
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=85",
    },
  ],
  pricingSnapshot: {
    merchandiseSubtotalLKR: 29900,
    deliveryFeeLKR: 500, // Retained snapshot fee
    discountLKR: 0,
    taxLKR: 0,
    totalLKR: 30400,
  },
  payment: {
    method: "cod",
    status: "unpaid",
  },
  status: "placed_cod",
  history: [
    {
      timestamp: new Date("2026-10-14T09:30:00Z").toISOString(),
      status: "placed_cod",
      note: "Demo Order placed with Cash on Delivery (COD). Unpaid.",
      updatedBy: "malik.f@example.lk",
    },
  ],
};

const orderStore = createDocumentStore<Order>({
  collection: "orders",
  fileName: "orders.json",
  getId: (order) => order.id,
  seed: () => [DEMO_ORDER],
});

export class OrderService {
  public async calculateCheckoutTotals(
    items: { productId: string; variantId: string; quantity: number }[],
    district?: string
  ): Promise<{
    merchandiseSubtotalLKR: number;
    deliveryFeeLKR: number;
    discountLKR: number;
    taxLKR: number;
    totalLKR: number;
    validatedItems: OrderItem[];
  }> {
    let subtotalCents = 0; // Using integer arithmetic to prevent floating point inaccuracy
    const validatedItems: OrderItem[] = [];

    for (const itemInput of items) {
      // Prices always come from the live catalogue, never from the client cart
      const product = await productService.getById(itemInput.productId);
      if (!product || product.isPublished === false || product.isArchived) continue;

      const variant = product.variants.find((v) => v.id === itemInput.variantId) || product.variants[0];
      const unitPriceLKR = variant ? variant.priceLKR : product.basePriceLKR;
      // Price-on-request items (no price set) cannot be bought online
      if (!unitPriceLKR || unitPriceLKR <= 0) continue;
      const quantity = Math.max(1, Math.min(itemInput.quantity, 10));

      const lineTotalCents = Math.round(unitPriceLKR * 100) * quantity;
      subtotalCents += lineTotalCents;

      validatedItems.push({
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        variantId: variant ? variant.id : "default",
        variantName: variant ? variant.name : "Standard",
        sku: variant ? variant.sku : product.sku,
        category: product.category,
        unitPriceLKR,
        quantity,
        lineTotalLKR: lineTotalCents / 100,
        image: product.images[0] || "",
      });
    }

    const merchandiseSubtotalLKR = subtotalCents / 100;

    // Delivery fee derived dynamically from active settings
    const settings = await settingsService.getSettings();
    let deliveryFeeLKR = await settingsService.getDeliveryFee(district);

    // Optional free delivery threshold
    if (settings.delivery.freeDeliveryThresholdLKR && merchandiseSubtotalLKR >= settings.delivery.freeDeliveryThresholdLKR) {
      deliveryFeeLKR = 0;
    }

    const discountLKR = 0;
    const taxLKR = 0; // Tax neutral until tax rules finalized
    const totalLKR = merchandiseSubtotalLKR + deliveryFeeLKR - discountLKR + taxLKR;

    return {
      merchandiseSubtotalLKR,
      deliveryFeeLKR,
      discountLKR,
      taxLKR,
      totalLKR,
      validatedItems,
    };
  }

  public async createOrder(input: CreateOrderInput): Promise<Order> {
    const { merchandiseSubtotalLKR, deliveryFeeLKR, discountLKR, taxLKR, totalLKR, validatedItems } =
      await this.calculateCheckoutTotals(input.items, input.customer.district);

    if (validatedItems.length === 0) {
      throw new Error("Cannot place an order with an empty or invalid cart.");
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `VIA-${dateStr}-${randomSuffix}`;
    const orderId = `ord-${Date.now()}-${randomSuffix}`;

    const isCOD = input.paymentMethod === "cod";
    const initialStatus: OrderStatus = isCOD ? "placed_cod" : "pending_payment";
    const initialPaymentStatus: PaymentStatus = "unpaid"; // COD is ALWAYS unpaid at order creation!

    const pricingSnapshot: PricingSnapshot = {
      merchandiseSubtotalLKR,
      deliveryFeeLKR, // Stored immutable delivery fee snapshot!
      discountLKR,
      taxLKR,
      totalLKR,
    };

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      confirmationToken: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      customer: input.customer,
      items: validatedItems,
      pricingSnapshot,
      payment: {
        method: input.paymentMethod,
        status: initialPaymentStatus,
        gateway: isCOD ? undefined : "payhere_sri_lanka",
      },
      status: initialStatus,
      history: [
        {
          timestamp: new Date().toISOString(),
          status: initialStatus,
          note: isCOD
            ? "Order placed via Cash on Delivery (COD). Unpaid, awaiting courier delivery and payment collection."
            : "Order created. Pending online digital payment gateway verification.",
          updatedBy: input.customer.email,
        },
      ],
    };

    await orderStore.put(newOrder.id, newOrder);

    return newOrder;
  }

  public async verifyOnlinePayment(
    orderId: string,
    transactionId: string,
    signature: string
  ): Promise<{ success: boolean; order?: Order; message?: string }> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      return { success: false, message: "Order not found." };
    }

    // Idempotency: If already paid, return early without re-crediting
    if (order.payment.status === "paid") {
      return { success: true, order, message: "Payment already verified (Idempotent response)." };
    }

    // Server-side validation of mock signature / gateway token
    if (!signature || signature.length < 6) {
      order.payment.status = "failed";
      order.payment.failureReason = "Invalid gateway signature response.";
      order.history.push({
        timestamp: new Date().toISOString(),
        status: order.status,
        note: "Online payment failed signature verification.",
        updatedBy: "gateway_webhook",
      });
      await this.updateOrder(order);
      return { success: false, message: "Payment verification failed." };
    }

    order.payment.status = "paid";
    order.payment.transactionId = transactionId;
    order.payment.paidAt = new Date().toISOString();
    order.status = "confirmed";
    order.history.push({
      timestamp: new Date().toISOString(),
      status: "confirmed",
      note: `Online payment authorized and verified via gateway transaction ID: ${transactionId}.`,
      updatedBy: "gateway_webhook",
    });

    await this.updateOrder(order);
    return { success: true, order };
  }

  public async recordPaymentCollection(
    orderId: string,
    adminUser: string,
    details: { receiptNumber?: string; notes?: string }
  ): Promise<Order> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found.");
    }

    order.payment.status = "paid";
    order.payment.collectedAt = new Date().toISOString();
    order.payment.collectedBy = adminUser;
    if (details.receiptNumber) {
      order.payment.receiptNumber = details.receiptNumber;
    }
    order.history.push({
      timestamp: new Date().toISOString(),
      status: order.status,
      note: `Payment collection of LKR ${order.pricingSnapshot.totalLKR} confirmed by ${adminUser}. ${details.receiptNumber ? `Receipt #${details.receiptNumber}. ` : ""}${details.notes || ""}`,
      updatedBy: adminUser,
    });

    await this.updateOrder(order);
    return order;
  }

  public async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminUser: string,
    note?: string
  ): Promise<Order> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found.");
    }

    const prevStatus = order.status;
    order.status = newStatus;
    order.history.push({
      timestamp: new Date().toISOString(),
      status: newStatus,
      note: note || `Order status updated from ${prevStatus} to ${newStatus} by ${adminUser}.`,
      updatedBy: adminUser,
    });

    await this.updateOrder(order);
    return order;
  }

  public async getAllOrders(): Promise<Order[]> {
    return orderStore.list();
  }

  public async getOrderById(id: string): Promise<Order | null> {
    return orderStore.get(id);
  }

  public async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const orders = await this.getAllOrders();
    return orders.find((o) => o.orderNumber === orderNumber) || null;
  }

  private async updateOrder(order: Order): Promise<void> {
    await orderStore.put(order.id, order);
  }
}

export const orderService = new OrderService();
