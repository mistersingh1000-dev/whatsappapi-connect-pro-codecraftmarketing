import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listAllConversations } from "@/lib/chat-db";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);

  const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "mistersingh1000@gmail.com").toLowerCase();
  if (!session || session.sub.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 501 });

  try {
    const conversations = await listAllConversations(db);
    return NextResponse.json({ conversations });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
