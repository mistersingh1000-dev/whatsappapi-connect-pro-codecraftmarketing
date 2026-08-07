import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb, listUsers } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
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

  try {
    const users = await listUsers(db);
    // Never expose password hashes or tokens to the admin UI.
    const safe = users.map(({ password_hash, wa_token, ...rest }) => rest);
    return NextResponse.json({ users: safe });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "list_failed" }, { status: 500 });
  }
}
