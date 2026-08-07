import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb, updateUser } from "@/lib/db";

export const runtime = "nodejs";

// Called by the Embedded Signup button after Meta returns the code + IDs.
// Exchanges the code for the customer's business token and stores the
// connected WhatsApp number against their account.
export async function POST(req: Request) {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const { code, waba_id, phone_number_id } = await req.json().catch(() => ({}));
  if (!waba_id || !phone_number_id) {
    return NextResponse.json({ error: "waba_id and phone_number_id are required." }, { status: 400 });
  }

  const APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
  const SECRET = process.env.META_APP_SECRET;
  const VERSION = process.env.WHATSAPP_API_VERSION || "v21.0";

  // Exchange the short-lived code for the customer's business token.
  let wa_token: string | null = null;
  if (code && APP_ID && SECRET) {
    try {
      const r = await fetch(
        `https://graph.facebook.com/${VERSION}/oauth/access_token?client_id=${APP_ID}&client_secret=${SECRET}&code=${encodeURIComponent(code)}`
      );
      const d = await r.json();
      wa_token = d.access_token ?? null;
      // TODO (optional): register the number for messaging:
      //   POST /{phone_number_id}/register { messaging_product:"whatsapp", pin:"XXXXXX" }
    } catch {
      // keep the IDs even if the exchange fails; can retry later
    }
  }

  // NOTE: in production, encrypt wa_token before storing it.
  const db = getDb();
  if (db) {
    await updateUser(db, session.sub, { waba_id, phone_number_id, wa_token });
  }

  return NextResponse.json({ ok: true, waba_id, phone_number_id, tokenStored: !!wa_token });
}
