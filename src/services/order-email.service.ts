import { BRAND_CONFIG, formatLKR } from "@/config/brand.config";
import { getSiteUrl } from "@/lib/site-url";
import { EmailMessage, getOrderAlertEmail, sendEmail } from "@/lib/email";
import type { Order, OrderStatus } from "@/types/order";

/**
 * Order emails: confirmation to the customer, alert to the store, and
 * customer updates when an order is confirmed, dispatched, delivered or cancelled.
 */

const COLORS = { ink: "#151412", muted: "#6B645B", line: "#E7E2D8", ground: "#F8F6F1", gold: "#B49A70" };

function escapeHtml(value: string | number | undefined | null): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstName(order: Order): string {
  return order.customer.fullName.trim().split(/\s+/)[0] || "there";
}

export function orderViewUrl(order: Order): string {
  const params = new URLSearchParams({ orderNumber: order.orderNumber, token: order.confirmationToken ?? "" });
  return `${getSiteUrl()}/checkout/success?${params.toString()}`;
}

function paymentLine(order: Order): string {
  if (order.payment.status === "paid") return "Paid";
  return order.payment.method === "cod"
    ? `Cash on delivery: please have ${formatLKR(order.pricingSnapshot.totalLKR)} ready`
    : "Awaiting payment";
}

function addressLines(order: Order): string[] {
  const c = order.customer;
  return [c.fullName, c.addressLine1, c.addressLine2, [c.city, c.district].filter(Boolean).join(", "), c.phone].filter(
    (line): line is string => Boolean(line && line.trim())
  );
}

function itemsText(order: Order): string {
  return order.items
    .map((item) => `- ${item.productName} (${item.variantName}) x ${item.quantity}: ${formatLKR(item.lineTotalLKR)}`)
    .join("\n");
}

function totalsText(order: Order): string {
  const p = order.pricingSnapshot;
  return [
    `Subtotal: ${formatLKR(p.merchandiseSubtotalLKR)}`,
    `Delivery: ${p.deliveryFeeLKR > 0 ? formatLKR(p.deliveryFeeLKR) : "Free"}`,
    ...(p.discountLKR > 0 ? [`Discount: -${formatLKR(p.discountLKR)}`] : []),
    `Total: ${formatLKR(p.totalLKR)}`,
  ].join("\n");
}

function orderSummaryHtml(order: Order): string {
  const p = order.pricingSnapshot;
  const row = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:4px 0;color:${strong ? COLORS.ink : COLORS.muted};${strong ? "font-weight:600;" : ""}">${label}</td>` +
    `<td align="right" style="padding:4px 0;color:${COLORS.ink};${strong ? "font-weight:600;" : ""}">${value}</td></tr>`;

  const items = order.items
    .map(
      (item) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid ${COLORS.line};color:${COLORS.ink};">` +
        `${escapeHtml(item.productName)}<br><span style="color:${COLORS.muted};font-size:13px;">${escapeHtml(item.variantName)} &times; ${item.quantity}</span></td>` +
        `<td align="right" style="padding:10px 0;border-bottom:1px solid ${COLORS.line};color:${COLORS.ink};white-space:nowrap;">${escapeHtml(formatLKR(item.lineTotalLKR))}</td></tr>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-top:8px;">${items}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-top:12px;">
      ${row("Subtotal", escapeHtml(formatLKR(p.merchandiseSubtotalLKR)))}
      ${row("Delivery", p.deliveryFeeLKR > 0 ? escapeHtml(formatLKR(p.deliveryFeeLKR)) : "Free")}
      ${p.discountLKR > 0 ? row("Discount", `-${escapeHtml(formatLKR(p.discountLKR))}`) : ""}
      ${row("Total", escapeHtml(formatLKR(p.totalLKR)), true)}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-top:20px;">
      <tr>
        <td valign="top" style="padding-right:12px;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.gold};margin-bottom:6px;">Delivering to</div>
          <div style="color:${COLORS.ink};line-height:1.5;">${addressLines(order).map(escapeHtml).join("<br>")}</div>
        </td>
        <td valign="top">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.gold};margin-bottom:6px;">Payment</div>
          <div style="color:${COLORS.ink};line-height:1.5;">${escapeHtml(paymentLine(order))}</div>
        </td>
      </tr>
    </table>`;
}

function layout({ heading, intro, body, cta }: { heading: string; intro: string; body: string; cta?: { label: string; href: string } }): string {
  const button = cta
    ? `<p style="margin:28px 0 0;"><a href="${escapeHtml(cta.href)}" style="display:inline-block;background:${COLORS.ink};color:#ffffff;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;padding:14px 24px;">${escapeHtml(cta.label)}</a></p>`
    : "";
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${COLORS.ground};font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.ground};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${COLORS.line};">
        <tr><td style="padding:28px 32px 0;font-family:Georgia,serif;font-size:22px;letter-spacing:3px;color:${COLORS.ink};">VIA SCENT</td></tr>
        <tr><td style="padding:24px 32px 32px;">
          <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:normal;font-size:26px;color:${COLORS.ink};">${escapeHtml(heading)}</h1>
          <p style="margin:0;font-size:15px;line-height:1.6;color:${COLORS.muted};">${intro}</p>
          ${body}
          ${button}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid ${COLORS.line};font-size:12px;line-height:1.6;color:${COLORS.muted};">
          Questions? Reply to this email, call or WhatsApp ${escapeHtml(BRAND_CONFIG.contact.phone)}.<br>
          ${escapeHtml(BRAND_CONFIG.brandName)} · ${escapeHtml(BRAND_CONFIG.contact.address)}<br>
          Authorised Dr. Scent franchisee in Sri Lanka
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const textFooter = `\n\nQuestions? Reply to this email, call or WhatsApp ${BRAND_CONFIG.contact.phone}.\n${BRAND_CONFIG.brandName}, ${BRAND_CONFIG.contact.address}`;

export function buildOrderConfirmationEmail(order: Order): EmailMessage {
  const url = orderViewUrl(order);
  const intro = `Hi ${escapeHtml(firstName(order))}, thank you for your order <strong style="color:${COLORS.ink};">${escapeHtml(order.orderNumber)}</strong>. We'll call you to confirm it and let you know when it's on its way.`;
  return {
    to: order.customer.email,
    subject: `Your VIA Scent order ${order.orderNumber}`,
    html: layout({ heading: "Thank you for your order", intro, body: orderSummaryHtml(order), cta: { label: "View your order", href: url } }),
    text:
      `Hi ${firstName(order)}, thank you for your order ${order.orderNumber}. We'll call you to confirm it and let you know when it's on its way.\n\n` +
      `${itemsText(order)}\n\n${totalsText(order)}\n\nDelivering to:\n${addressLines(order).join("\n")}\n\nPayment: ${paymentLine(order)}\n\n` +
      `View your order: ${url}${textFooter}`,
  };
}

export function buildNewOrderAlertEmail(order: Order): EmailMessage {
  const c = order.customer;
  const adminUrl = `${getSiteUrl()}/admin`;
  const method = order.payment.method === "cod" ? "Cash on delivery" : "Online payment";
  const intro =
    `${escapeHtml(c.fullName)} placed order <strong style="color:${COLORS.ink};">${escapeHtml(order.orderNumber)}</strong> ` +
    `for ${escapeHtml(formatLKR(order.pricingSnapshot.totalLKR))} (${escapeHtml(method)}).<br>` +
    `Phone: ${escapeHtml(c.phone)} · Email: ${escapeHtml(c.email)}` +
    (c.notes ? `<br>Note from customer: ${escapeHtml(c.notes)}` : "");
  return {
    to: getOrderAlertEmail(),
    replyTo: c.email,
    subject: `New order ${order.orderNumber}: ${formatLKR(order.pricingSnapshot.totalLKR)} from ${c.fullName}`,
    html: layout({ heading: "New order", intro, body: orderSummaryHtml(order), cta: { label: "Open admin", href: adminUrl } }),
    text:
      `${c.fullName} placed order ${order.orderNumber} for ${formatLKR(order.pricingSnapshot.totalLKR)} (${method}).\n` +
      `Phone: ${c.phone}\nEmail: ${c.email}\n${c.notes ? `Note: ${c.notes}\n` : ""}\n${itemsText(order)}\n\n${totalsText(order)}\n\n` +
      `Delivering to:\n${addressLines(order).join("\n")}\n\nAdmin: ${adminUrl}`,
  };
}

const STATUS_COPY: Partial<Record<OrderStatus, { subject: string; heading: string; message: (order: Order) => string }>> = {
  confirmed: {
    subject: "Your order is confirmed",
    heading: "Your order is confirmed",
    message: () => "We've confirmed your order and are getting it ready. We'll email you again when it's on its way.",
  },
  dispatched: {
    subject: "Your order is on its way",
    heading: "Your order is on its way",
    message: (order) =>
      "Your order has left our Colombo store. The courier will call you before delivery." +
      (order.payment.method === "cod" && order.payment.status !== "paid"
        ? ` Please have ${formatLKR(order.pricingSnapshot.totalLKR)} ready in cash.`
        : ""),
  },
  delivered: {
    subject: "Your order has been delivered",
    heading: "Enjoy your new scent",
    message: () =>
      "Your order has been delivered. If anything isn't right, you can return unopened items or a faulty machine within 7 days. Just reply to this email.",
  },
  cancelled: {
    subject: "Your order has been cancelled",
    heading: "Your order has been cancelled",
    message: () => "Your order has been cancelled. If you didn't expect this, reply to this email or give us a call and we'll sort it out.",
  },
};

/** Returns the customer email for a status change, or null when the status isn't one customers hear about. */
export function buildStatusUpdateEmail(order: Order): EmailMessage | null {
  const copy = STATUS_COPY[order.status];
  if (!copy) return null;
  const url = orderViewUrl(order);
  const message = copy.message(order);
  return {
    to: order.customer.email,
    subject: `${copy.subject} (${order.orderNumber})`,
    html: layout({
      heading: copy.heading,
      intro: `Hi ${escapeHtml(firstName(order))}, ${escapeHtml(message.charAt(0).toLowerCase() + message.slice(1))}`,
      body: orderSummaryHtml(order),
      cta: { label: "View your order", href: url },
    }),
    text: `Hi ${firstName(order)}, ${message.charAt(0).toLowerCase() + message.slice(1)}\n\nOrder ${order.orderNumber}\n${itemsText(order)}\n\n${totalsText(order)}\n\nView your order: ${url}${textFooter}`,
  };
}

/** Sends the customer confirmation and the store alert for a newly placed order. */
export async function notifyOrderPlaced(order: Order): Promise<void> {
  await Promise.allSettled([sendEmail(buildOrderConfirmationEmail(order)), sendEmail(buildNewOrderAlertEmail(order))]);
}

/** Emails the customer about their order's new status, if it's one they hear about. */
export async function notifyOrderStatusChanged(order: Order): Promise<void> {
  const email = buildStatusUpdateEmail(order);
  if (email) await sendEmail(email);
}
