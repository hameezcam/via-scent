import { NextRequest, NextResponse } from "next/server";
import { clientIp, isRateLimited, isValidEmail, sendFormEmail, singleLine } from "@/lib/email";

/**
 * Receives the public Contact form and the B2B Quote Request form
 * and forwards each submission by email (see src/lib/email.ts).
 */

const MAX_SHORT = 150;
const MAX_LONG = 5000;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill the "website" field.
  if (str(body.website, 200)) {
    return NextResponse.json({ success: true });
  }

  if (isRateLimited(clientIp(req.headers))) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const type = body.type;

  if (type === "contact") {
    const name = str(body.name, MAX_SHORT);
    const email = str(body.email, 254).toLowerCase();
    const phone = str(body.phone, 40);
    const subject = str(body.subject, MAX_SHORT);
    const message = str(body.message, MAX_LONG);

    if (!name || !message || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please provide your name, a valid email address and a message." },
        { status: 400 }
      );
    }

    const sent = await sendFormEmail({
      subject: `Website enquiry: ${singleLine(subject || "General")} from ${singleLine(name)}`,
      heading: "New contact form message",
      replyTo: email,
      fields: [
        { label: "Name", value: name },
        { label: "Email", value: email },
        { label: "Phone / WhatsApp", value: phone },
        { label: "Nature of inquiry", value: subject },
        { label: "Message", value: message },
      ],
    });

    if (!sent) {
      return NextResponse.json(
        { error: "We couldn't send your message right now. Please email us directly at info@vialk.com." },
        { status: 502 }
      );
    }
    return NextResponse.json({ success: true });
  }

  if (type === "quote") {
    const fullName = str(body.fullName, MAX_SHORT);
    const companyName = str(body.companyName, MAX_SHORT);
    const businessEmail = str(body.businessEmail, 254).toLowerCase();
    const phoneNumber = str(body.phoneNumber, 40);
    const industry = str(body.industry, MAX_SHORT);
    const cityDistrict = str(body.cityDistrict, MAX_SHORT);
    const spaceSize = str(body.spaceSize, MAX_SHORT);
    const preferredContact = str(body.preferredContact, 40);
    const requirementsDescription = str(body.requirementsDescription, MAX_LONG);
    const servicesOfInterest = Array.isArray(body.servicesOfInterest)
      ? body.servicesOfInterest.filter((s): s is string => typeof s === "string").slice(0, 20).map((s) => s.slice(0, MAX_SHORT))
      : [];

    if (!fullName || !companyName || !phoneNumber || !industry || !isValidEmail(businessEmail)) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }
    if (body.privacyConsent !== true) {
      return NextResponse.json({ error: "Privacy consent is required." }, { status: 400 });
    }

    const sent = await sendFormEmail({
      subject: `Commercial quote request: ${singleLine(companyName)} (${singleLine(industry)})`,
      heading: "New commercial scenting quote request",
      replyTo: businessEmail,
      fields: [
        { label: "Contact person", value: fullName },
        { label: "Organization", value: companyName },
        { label: "Email", value: businessEmail },
        { label: "Phone / WhatsApp", value: phoneNumber },
        { label: "Industry", value: industry },
        { label: "Location", value: cityDistrict },
        { label: "Estimated area", value: spaceSize },
        { label: "Solutions of interest", value: servicesOfInterest.join(", ") },
        { label: "Preferred contact", value: preferredContact },
        { label: "Notes", value: requirementsDescription },
      ],
    });

    if (!sent) {
      return NextResponse.json(
        { error: "We couldn't send your brief right now. Please email us directly at info@vialk.com." },
        { status: 502 }
      );
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown form type." }, { status: 400 });
}
