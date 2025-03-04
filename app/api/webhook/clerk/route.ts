import { Webhook, WebhookRequiredHeaders } from "svix";
import { NextResponse } from "next/server";

const expectedTypes = ["session.created", "user.created", "user.updated"];

export async function POST(req: Request) {
    console.log("webhook post route");

    const payload = await req.json();
    console.log("📦 Payload received:", payload);

    const heads = {
        "svix-id": req.headers.get("svix-id"),
        "svix-timestamp": req.headers.get("svix-timestamp"),
        "svix-signature": req.headers.get("svix-signature"),
    };

    console.log("🔎 All received headers:", heads);
    console.log("webhook secret loaded:", process.env.NEXT_CLERK_WEBHOOK_SECRET);

    if (!payload?.object || !payload?.type) {
        console.warn("⚠️ Ignoring non-event webhook request");
        return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    if (!expectedTypes.includes(payload.type)) {
        console.warn("⚠️ Ignoring unexpected webhook event type:", payload.type);
        return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const wh = new Webhook(process.env.NEXT_CLERK_WEBHOOK_SECRET || "");

    try {
        const evt = wh.verify(
            JSON.stringify(payload),
            heads as WebhookRequiredHeaders
        );

        console.log("✅ Verified webhook event:", evt);
        return NextResponse.json({ status: "success" }, { status: 200 });
    } catch (err) {
        console.error("❌ Webhook verification failed:", err);
        return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }
}
