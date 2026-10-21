import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { clientIp, isRateLimited, sendFormEmail, singleLine } from "@/lib/email";

const DATA_FILE = path.join(process.cwd(), "src/data/newsletter-subscribers.json");

interface SubscriberRecord {
  email: string;
  subscribedAt: string;
  source: string;
}

function getSubscribers(): SubscriberRecord[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function saveSubscribers(list: SubscriberRecord[]): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("[Newsletter API] Error saving subscriber:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(clientIp(req.headers))) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    // Server-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 254) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const subscribers = getSubscribers();
    const existing = subscribers.find((s) => s.email === email);

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message:
          "You are already enrolled in The Olfactory Gazette. You will continue to receive private franchise announcements.",
      });
    }

    const newSubscriber: SubscriberRecord = {
      email,
      subscribedAt: new Date().toISOString(),
      source: "homepage_newsletter",
    };

    subscribers.push(newSubscriber);
    saveSubscribers(subscribers);

    // The subscriber file can't be written on Vercel, so email is the record.
    const emailed = await sendFormEmail({
      subject: `New newsletter subscriber: ${singleLine(email)}`,
      heading: "New newsletter subscriber",
      fields: [
        { label: "Email", value: email },
        { label: "Source", value: newSubscriber.source },
        { label: "Subscribed at", value: newSubscriber.subscribedAt },
      ],
    });
    if (!emailed) {
      return NextResponse.json(
        { error: "Unable to process subscription. Please try again shortly." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadySubscribed: false,
      message:
        "Welcome to the Olfactory Gazette. You will receive private announcements for rare seasonal formulations and private franchise exhibitions.",
    });
  } catch (err) {
    console.error("[Newsletter API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unable to process subscription. Please try again shortly." },
      { status: 500 }
    );
  }
}
