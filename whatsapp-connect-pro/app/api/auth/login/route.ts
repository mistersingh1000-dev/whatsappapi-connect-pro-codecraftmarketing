import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, createSession } from "@/lib/auth";
import { getDb, findUser } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "no_db", message: "Login needs a database. Add FIREBASE_SERVICE_ACCOUNT in Vercel to enable it." },
      { status: 501 }
    );
  }

  const user = await findUser(db, email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json(
      { error: "invalid", message: "Incorrect email or password." },
      { status: 401 }
    );
  }

  if (user.plan === "suspended") {
    return NextResponse.json(
      { error: "suspended", message: "This account is suspended. Contact support." },
      { status: 403 }
    );
  }

  const expired = user.plan !== "paid" && new Date(user.trial_ends_at).getTime() < Date.now();
  const plan = expired ? "expired" : (user.plan as any);

  const token = await createSession({
    email: user.email,
    name: user.name || user.email,
    plan,
    trialEndsAt: user.trial_ends_at,
  });
  const res = NextResponse.json({ ok: true, plan, readOnly: expired });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 86400,
  });
  return res;
}
