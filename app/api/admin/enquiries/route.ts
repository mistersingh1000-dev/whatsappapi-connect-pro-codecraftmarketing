import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

function adminEmail() {
  return (process.env.ADMIN_EMAIL || "mistersingh1000@gmail.com").toLowerCase();
}

export async function GET() {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session || session.sub.toLowerCase() !== adminEmail()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 501 });

  try {
    const snap = await db.collection("enquiries").get();
    const enquiries = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    enquiries.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return NextResponse.json({ enquiries });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session || session.sub.toLowerCase() !== adminEmail()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 501 });

  const { id, status } = await req.json().catch(() => ({}));
  if (!id || !["new", "contacted", "closed"].includes(status)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    await db.collection("enquiries").doc(id).update({ status });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
