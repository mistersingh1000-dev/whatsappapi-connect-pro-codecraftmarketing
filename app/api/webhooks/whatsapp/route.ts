import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createConversation, addMessage, updateMessageStatus, convId } from "@/lib/chat-db";

export const runtime = "nodejs";

function validMetaSignature(rawBody: string, signature: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signature?.startsWith("sha256=")) return false;

  const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

// Meta calls this to verify the webhook subscription.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expected = process.env.WHATSAPP_WEBHOOK_TOKEN;
  if (mode === "subscribe" && expected && token === expected) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return NextResponse.json({ error: "invalid_verify_token" }, { status: 403 });
}

// Incoming messages and delivery receipts.
export async function POST(req: Request) {
  const rawBody = await req.text();
  if (!process.env.META_APP_SECRET) {
    console.error("Webhook received but META_APP_SECRET is not configured");
    return NextResponse.json({ error: "webhook_security_not_configured" }, { status: 503 });
  }

  if (!validMetaSignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    console.error("Webhook received but database is not configured");
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  try {
    const body = JSON.parse(rawBody || "{}");

    for (const entry of body?.entry || []) {
      for (const change of entry?.changes || []) {
        const value = change?.value;
        if (!value) continue;

        const phoneNumberId = value?.metadata?.phone_number_id;
        if (!phoneNumberId) continue;

        // Which of our customers owns this WhatsApp number?
        const owners = await db
          .collection("users")
          .where("phone_number_id", "==", phoneNumberId)
          .limit(1)
          .get();

        if (owners.empty) {
          console.warn("No user for phone_number_id", phoneNumberId);
          continue;
        }

        const owner = owners.docs[0].data() as any;
        const userId = owner.email as string;

        // Delivery / read receipts for messages we sent.
        for (const status of value?.statuses || []) {
          if (status?.id && status?.status) {
            await updateMessageStatus(db, status.id, status.status);
          }
        }

        // Inbound messages.
        for (const msg of value?.messages || []) {
          const from = msg?.from;
          if (!from) continue;

          const text =
            msg?.text?.body ||
            msg?.button?.text ||
            msg?.interactive?.list_reply?.title ||
            msg?.interactive?.button_reply?.title ||
            `[${msg?.type || "unsupported"} message]`;

          const id = convId(userId, from);
          const existing = await db.collection("conversations").doc(id).get();

          if (!existing.exists) {
            const profileName = value?.contacts?.[0]?.profile?.name || null;
            await createConversation(
              db,
              userId,
              phoneNumberId,
              owner.waba_id || null,
              from,
              profileName
            );
          }

          await addMessage(db, userId, id, "contact", text, msg?.id || null);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Webhook error:", e?.message || e);
    // Return a retriable error rather than acknowledging and silently dropping data.
    return NextResponse.json({ error: "webhook_processing_failed" }, { status: 500 });
  }
}
