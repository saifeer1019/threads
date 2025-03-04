import { Webhook, WebhookRequiredHeaders } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("webhook post route")
  const payload = await req.json();

  // Correctly retrieve headers using `next/headers`
  const header = headers();

  const heads = {
    "svix-id": header.get("svix-id"),
    "svix-timestamp": header.get("svix-timestamp"),
    "svix-signature": header.get("svix-signature"),
  };

  const wh = new Webhook(process.env.NEXT_CLERK_WEBHOOK_SECRET || "");
  console.log("webhook env" + wh)
  try {
    const evt = wh.verify(
      JSON.stringify(payload),
      heads as WebhookRequiredHeaders
    );

    console.log("✅ Webhook received:", evt);

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }
}
