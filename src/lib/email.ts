/**
 * Transactional email via Resend (https://resend.com), called over its REST API.
 *
 * - RESEND_API_KEY      required; without it emails are skipped and logged
 * - EMAIL_FROM          sender, e.g. "VIA Scent <orders@vialk.com>" (domain must be verified in Resend)
 * - ORDER_ALERT_EMAIL   where new-order alerts go (defaults to the store contact email)
 *
 * Sending never throws: a failed email must not fail the order it is about.
 */

import { BRAND_CONFIG } from "@/config/brand.config";

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export type EmailResult = { sent: true; id: string } | { sent: false; reason: string };

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || `${BRAND_CONFIG.brandName} <onboarding@resend.dev>`;
}

export function getOrderAlertEmail(): string {
  return process.env.ORDER_ALERT_EMAIL?.trim() || BRAND_CONFIG.contact.email;
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[Email] RESEND_API_KEY not set, skipped "${message.subject}"`);
    return { sent: false, reason: "not_configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: getEmailFrom(),
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        reply_to: message.replyTo ?? BRAND_CONFIG.contact.email,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok || !data.id) {
      console.error(`[Email] Resend rejected "${message.subject}": ${res.status} ${data.message ?? ""}`);
      return { sent: false, reason: data.message || `http_${res.status}` };
    }
    return { sent: true, id: data.id };
  } catch (err) {
    console.error(`[Email] Failed to send "${message.subject}":`, err);
    return { sent: false, reason: "network_error" };
  }
}
