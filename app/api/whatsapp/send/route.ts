import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb, findUser, type AppUser } from "@/lib/db";
import { decryptCredential } from "@/lib/credential-crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  let plan = session.plan as string;
  let trialEndsAt = session.trialEndsAt;
  let user: AppUser | null = null;

  const db = getDb();
  if (db) {
    const data = await findUser(db, session.sub);
    if (data) {
      user = data;
      plan = data.plan;
      trialEndsAt = data.trial_ends_at;
    }
  }

  const expired = plan !== "paid" && new Date(trialEndsAt).getTime() < Date.now();
  if (expired) {
    return NextResponse.json(
      { error: "trial_expired", message: "Your free trial has ended. Upgrade to send messages." },
      { status: 402 }
    );
  }

  const { to, message, template } = await req.json().catch(() => ({}));
  if (!to || (!message && !template?.name)) {
    return NextResponse.json(
      { error: "`to` and either `message` or `template.name` are required." },
      { status: 400 }
    );
  }

  const VERSION = process.env.WHATSAPP_API_VERSION || "v26.0";
  // Prefer the user's own connected number; fall back to a shared trial number.
  const PHONE_ID = user?.phone_number_id || process.env.WHATSAPP_TRIAL_PHONE_NUMBER_ID;
  const storedToken = user?.wa_token || process.env.WHATSAPP_TRIAL_TOKEN || null;
  const TOKEN = decryptCredential(storedToken);

  if (!PHONE_ID || !TOKEN) {
    return NextResponse.json(
      {
        error: "whatsapp_not_connected",
        message: "Connect a WhatsApp number before sending real messages.",
      },
      { status: 400 }
    );
  }

  const payload = template?.name
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template.name,
          language: { code: template.language || "en_US" },
          ...(Array.isArray(template.components) ? { components: template.components } : {}),
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      };

  const res = await fetch(
    `https://graph.facebook.com/${VERSION}/${encodeURIComponent(PHONE_ID)}/messages`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(
    {
      ok: res.ok,
      result: data,
      ...(res.ok
        ? {}
        : {
            message:
              data?.error?.message ||
              "WhatsApp rejected the message. Use an approved template when starting a conversation outside the 24-hour customer-service window.",
          }),
    },
    { status: res.ok ? 200 : 502 }
  );
}
