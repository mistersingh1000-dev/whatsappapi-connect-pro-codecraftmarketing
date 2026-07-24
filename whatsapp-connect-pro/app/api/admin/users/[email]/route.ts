import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb, updateUser } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: any) {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);

  const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "mistersingh1000@gmail.com").toLowerCase();
  if (!session || session.sub.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 501 });
  }

  const email = decodeURIComponent(params?.email || "");
  const { plan, trial_ends_at } = await req.json().catch(() => ({}));
  const updates: Record<string, string> = {};
  if (plan) updates.plan = plan;
  if (trial_ends_at) updates.trial_ends_at = trial_ends_at;
  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  }

  try {
    const user = await updateUser(db, email, updates);
    if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    const { password_hash, wa_token, ...safe } = user;
    return NextResponse.json({ ok: true, user: safe });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "update_failed" }, { status: 500 });
  }
}
