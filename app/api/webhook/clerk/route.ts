import { Webhook, WebhookRequiredHeaders } from "svix";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("webhook post route");

  const payload = await req.json();

  // Safer - directly use `req.headers`
  const heads = {
    "svix-id": req.headers.get("svix-id"),
    "svix-timestamp": req.headers.get("svix-timestamp"),
    "svix-signature": req.headers.get("svix-signature"),
  };

  console.log("🔎 All received headers:", heads);

  const wh = new Webhook(process.env.NEXT_CLERK_WEBHOOK_SECRET || "");
  console.log("webhook secret loaded:", process.env.NEXT_CLERK_WEBHOOK_SECRET);

  try {
    const evt = wh.verify(
      JSON.stringify(payload),
      heads as WebhookRequiredHeaders
    );

    console.log("✅ Webhook verified and received:", evt);

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }
}
