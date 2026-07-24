import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb, findUser, type AppUser } from "@/lib/db";

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

  const { to, message } = await req.json().catch(() => ({}));
  if (!to || !message) {
    return NextResponse.json({ error: "`to` and `message` are required." }, { status: 400 });
  }

  const VERSION = process.env.WHATSAPP_API_VERSION || "v21.0";
  // Prefer the user's own connected number; fall back to a shared trial number.
  const PHONE_ID = user?.phone_number_id || process.env.WHATSAPP_TRIAL_PHONE_NUMBER_ID;
  const TOKEN = user?.wa_token || process.env.WHATSAPP_TRIAL_TOKEN;

  if (!PHONE_ID || !TOKEN) {
    return NextResponse.json({
      ok: true,
      simulated: true,
      note: "Demo mode — connect a number via Embedded Signup, or set shared trial credentials, to send real messages.",
      to,
    });
  }

  const res = await fetch(`https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: message } }),
  });
  const data = await res.json();
  return NextResponse.json({ ok: res.ok, result: data }, { status: res.ok ? 200 : 502 });
}
