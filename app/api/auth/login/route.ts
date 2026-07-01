import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, createSession } from "@/lib/auth";
import { getSupabase, type AppUser } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const db = getSupabase();
  if (!db) {
    return NextResponse.json(
      { error: "no_db", message: "Login needs a database. Add your Supabase keys to enable it." },
      { status: 501 }
    );
  }

  const { data: user } = await db
    .from("app_users")
    .select("*")
    .eq("email", email)
    .maybeSingle<AppUser>();

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json(
      { error: "invalid", message: "Incorrect email or password." },
      { status: 401 }
    );
  }

  const expired = user.plan !== "paid" && new Date(user.trial_ends_at).getTime() < Date.now();
  const plan = expired ? "expired" : user.plan;

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
