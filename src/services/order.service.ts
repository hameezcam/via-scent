import fs from "fs";
import path from "path";
import { Order, OrderItem, CustomerDetails, PaymentMethod, OrderStatus, PaymentStatus, PricingSnapshot } from "../types/order";
import { settingsService } from "./settings.service";
import { PRODUCTS } from "../data/products";

const ORDERS_FILE_PATH = path.join(process.cwd(), "src/data/orders.json");

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

export class OrderService {
  private inMemoryOrders: Order[] | null = null;

  public calculateCheckoutTotals(
    items: { productId: string; variantId: string; quantity: number }[],
    district?: string
  ): {
    merchandiseSubtotalLKR: number;
    deliveryFeeLKR: number;
    discountLKR: number;
    taxLKR: number;
    totalLKR: number;
    validatedItems: OrderItem[];
  } {
    let subtotalCents = 0; // Using integer arithmetic to prevent floating point inaccuracy
    const validatedItems: OrderItem[] = [];

    for (const itemInput of items) {
      const product = PRODUCTS.find((p) => p.id === itemInput.productId);
      if (!product) continue;

      const variant = product.variants.find((v) => v.id === itemInput.variantId) || product.variants[0];
      const unitPriceLKR = variant ? variant.priceLKR : product.basePriceLKR;
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
    const settings = settingsService.getSettings();
    let deliveryFeeLKR = settingsService.getDeliveryFee(district);

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

  public createOrder(input: CreateOrderInput): Order {
    const { merchandiseSubtotalLKR, deliveryFeeLKR, discountLKR, taxLKR, totalLKR, validatedItems } =
      this.calculateCheckoutTotals(input.items, input.customer.district);

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

    const orders = this.getAllOrders();
    orders.unshift(newOrder);
    this.saveOrders(orders);

    return newOrder;
  }

  public verifyOnlinePayment(
    orderId: string,
    transactionId: string,
    signature: string
  ): { success: boolean; order?: Order; message?: string } {
    const order = this.getOrderById(orderId);
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
      this.updateOrder(order);
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

    this.updateOrder(order);
    return { success: true, order };
  }

  public recordPaymentCollection(
    orderId: string,
    adminUser: string,
    details: { receiptNumber?: string; notes?: string }
  ): Order {
    const order = this.getOrderById(orderId);
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

    this.updateOrder(order);
    return order;
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminUser: string,
    note?: string
  ): Order {
    const order = this.getOrderById(orderId);
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

    this.updateOrder(order);
    return order;
  }

  public getAllOrders(): Order[] {
    if (this.inMemoryOrders) {
      return this.inMemoryOrders;
    }

    try {
      if (fs.existsSync(ORDERS_FILE_PATH)) {
        const raw = fs.readFileSync(ORDERS_FILE_PATH, "utf-8");
        this.inMemoryOrders = JSON.parse(raw);
        return this.inMemoryOrders!;
      }
    } catch {
      // Fallback
    }

    // Seed with a clear initial demo order if none exist
    this.inMemoryOrders = [
      {
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
      },
    ];

    return this.inMemoryOrders;
  }

  public getOrderById(id: string): Order | null {
    const orders = this.getAllOrders();
    return orders.find((o) => o.id === id) || null;
  }

  public getOrderByNumber(orderNumber: string): Order | null {
    const orders = this.getAllOrders();
    return orders.find((o) => o.orderNumber === orderNumber) || null;
  }

  private updateOrder(order: Order) {
    const orders = this.getAllOrders();
    const index = orders.findIndex((o) => o.id === order.id);
    if (index > -1) {
      orders[index] = order;
      this.saveOrders(orders);
    }
  }

  private saveOrders(orders: Order[]) {
    this.inMemoryOrders = orders;
    try {
      const dir = path.dirname(ORDERS_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), "utf-8");
    } catch {
      // In-memory fallback
    }
  }
}

export const orderService = new OrderService();
