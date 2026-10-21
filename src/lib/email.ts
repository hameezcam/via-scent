/**
 * Form-notification email delivery via the Resend HTTP API.
 *
 * Required environment variables (set in Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY     – API key from https://resend.com
 *   FORM_FROM_EMAIL    – verified sender, e.g. "VIA Scent Website <noreply@vialk.com>"
 * Optional:
 *   FORM_TO_EMAIL      – inbox that receives submissions (defaults to info@vialk.com)
 */

const DEFAULT_TO = "info@vialk.com";
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface EmailField {
  label: string;
  value: string | undefined | null;
}

export interface FormEmail {
  subject: string;
  heading: string;
  fields: EmailField[];
  /** Customer address, so staff can just hit "Reply". */
  replyTo?: string;
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strips CR/LF so user input can never inject extra email headers via the subject. */
export function singleLine(input: string, max = 150): string {
  return input.replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function renderHtml(email: FormEmail): string {
  const rows = email.fields
    .filter((f) => f.value !== undefined && f.value !== null && String(f.value).trim() !== "")
    .map(
      (f) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#78716c;font-size:12px;vertical-align:top;white-space:nowrap;">${escapeHtml(f.label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1c1917;font-size:14px;white-space:pre-wrap;">${escapeHtml(String(f.value))}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#faf8f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:8px;overflow:hidden;">
    <div style="padding:16px 20px;background:#1c1917;color:#fef3c7;font-size:16px;">${escapeHtml(email.heading)}</div>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
    <div style="padding:12px 20px;color:#a8a29e;font-size:11px;">Sent from the VIA Scent website · ${new Date().toISOString()}</div>
  </div>
</body></html>`;
}

function renderText(email: FormEmail): string {
  const lines = email.fields
    .filter((f) => f.value !== undefined && f.value !== null && String(f.value).trim() !== "")
    .map((f) => `${f.label}: ${f.value}`);
  return `${email.heading}\n\n${lines.join("\n")}\n`;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.FORM_FROM_EMAIL);
}

/**
 * Sends a form notification. Returns true on success.
 * Never throws: callers decide whether a failed send should fail the request.
 */
export async function sendFormEmail(email: FormEmail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FORM_FROM_EMAIL;
  const to = process.env.FORM_TO_EMAIL || DEFAULT_TO;

  if (!apiKey || !from) {
    console.error("[Email] RESEND_API_KEY or FORM_FROM_EMAIL is not set; form notification not sent.");
    return false;
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: singleLine(email.subject, 200),
        html: renderHtml(email),
        text: renderText(email),
        ...(email.replyTo && isValidEmail(email.replyTo) ? { reply_to: email.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[Email] Resend responded ${res.status}: ${detail.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Email] Failed to reach Resend:", err);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Lightweight per-IP rate limiting for public form endpoints.        */
/* Best-effort only: serverless instances don't share memory.         */
/* ------------------------------------------------------------------ */

const hits = new Map<string, number[]>();

export function isRateLimited(ip: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > limit;
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
