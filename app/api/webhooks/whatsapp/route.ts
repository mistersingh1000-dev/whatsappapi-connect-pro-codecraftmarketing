import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createConversation, addMessage, updateMessageStatus, convId } from "@/lib/chat-db";

export const runtime = "nodejs";

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
  const db = getDb();
  // Always 200 back to Meta, otherwise it retries and eventually disables the
  // webhook. Log the problem instead of returning an error status.
  if (!db) {
    console.error("Webhook received but database is not configured");
    return NextResponse.json({ ok: true });
  }

  try {
    const body = await req.json().catch(() => ({}));

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
    return NextResponse.json({ ok: true });
  }
}
