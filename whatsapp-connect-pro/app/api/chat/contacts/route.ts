import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getFirestore } from "firebase-admin/firestore";
import { createContact, listContacts } from "@/lib/chat-db";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 501 });

  try {
    const fsDb = getFirestore();
    const contacts = await listContacts(fsDb, session.sub);
    return NextResponse.json({ contacts });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 501 });

  const { phone, name } = await req.json().catch(() => ({}));
  if (!phone) return NextResponse.json({ error: "phone_required" }, { status: 400 });

  try {
    const fsDb = getFirestore();
    const contact = await createContact(fsDb, session.sub, phone, name || null);
    return NextResponse.json({ contact }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
