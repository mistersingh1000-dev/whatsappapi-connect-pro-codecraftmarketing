import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb, findUser } from "@/lib/db";
import { getFirestore } from "firebase-admin/firestore";
import { getConversation, addMessage } from "@/lib/chat-db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 501 });

  const { conversationId, content } = await req.json().catch(() => ({}));
  if (!conversationId || !content) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const fsDb = getFirestore();
    const conv = await getConversation(fsDb, conversationId);
    if (!conv) return NextResponse.json({ error: "conversation_not_found" }, { status: 404 });
    if (conv.userId !== session.sub) return NextResponse.json({ error: "unauthorized" }, { status: 403 });

    const user = await findUser(db, session.sub);
    if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

    const isExpired = user.plan !== "paid" && new Date(user.trial_ends_at).getTime() < Date.now();
    if (isExpired) {
      return NextResponse.json({ error: "trial_expired" }, { status: 402 });
    }

    const msg = await addMessage(fsDb, conversationId, "user", content);
    return NextResponse.json({ message: msg });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
