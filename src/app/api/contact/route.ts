import { NextRequest, NextResponse } from "next/server";
import { createDocumentStore } from "@/lib/document-store";
import { getOrderAlertEmail, sendEmail } from "@/lib/email";
import { afterResponse } from "@/lib/after-response";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}

const messageStore = createDocumentStore<ContactMessage>({
  collection: "contact_messages",
  fileName: "contact-messages.json",
  getId: (m) => m.id,
});

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = clean(body?.name, 120);
  const email = clean(body?.email, 254).toLowerCase();
  const phone = clean(body?.phone, 40);
  const subject = clean(body?.subject, 120) || "Enquiry";
  const message = clean(body?.message, 5000);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please add your name, a valid email and a message." }, { status: 400 });
  }

  const record: ContactMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    email,
    phone,
    subject,
    message,
    createdAt: new Date().toISOString(),
  };
  await messageStore.put(record.id, record);

  afterResponse(async () => {
    await sendEmail({
      to: getOrderAlertEmail(),
      replyTo: email,
      subject: `New message from ${name}: ${subject}`,
      text: `${name} <${email}>${phone ? ` ${phone}` : ""}\n\n${message}`,
      html: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;${
        phone ? ` ${escapeHtml(phone)}` : ""
      }</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    });
  });

  return NextResponse.json({ success: true });
}
