import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb, updateUser } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const { phone_number_id, waba_id, wa_token } = await req.json().catch(() => ({}));
  if (!phone_number_id || !wa_token) {
    return NextResponse.json(
      { error: "missing", message: "Phone Number ID and access token are required." },
      { status: 400 }
    );
  }

  const VERSION = process.env.WHATSAPP_API_VERSION || "v21.0";

  let display = "";
  try {
    const r = await fetch(
      `https://graph.facebook.com/${VERSION}/${phone_number_id}?fields=display_phone_number,verified_name`,
      { headers: { Authorization: `Bearer ${wa_token}` } }
    );
    const info = await r.json();
    if (!r.ok) {
      return NextResponse.json(
        { error: "invalid", message: info?.error?.message || "Meta rejected these credentials. Double-check the Phone Number ID and token." },
        { status: 400 }
      );
    }
    display = info.display_phone_number || "";
  } catch {
    return NextResponse.json(
      { error: "verify_failed", message: "Could not reach Meta to verify. Try again." },
      { status: 502 }
    );
  }

  const db = getDb();
  if (db) {
    await updateUser(db, session.sub, { phone_number_id, waba_id: waba_id || null, wa_token });
  }

  return NextResponse.json({ ok: true, phone_number_id, display });
}
