import { NextRequest, NextResponse } from "next/server";
import { createDocumentStore } from "@/lib/document-store";

interface SubscriberRecord {
  email: string;
  subscribedAt: string;
  source: string;
}

const subscriberStore = createDocumentStore<SubscriberRecord>({
  collection: "newsletter",
  fileName: "newsletter-subscribers.json",
  getId: (subscriber) => subscriber.email,
});

export async function POST(req: NextRequest) {
  try {
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

    const existing = await subscriberStore.get(email);

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

    await subscriberStore.put(email, newSubscriber);

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
