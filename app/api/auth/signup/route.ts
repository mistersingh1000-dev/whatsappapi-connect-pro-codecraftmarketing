import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, createSession, newTrialEnd, TRIAL_DAYS } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { name, email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const trialEndsAt = newTrialEnd();
  const db = getSupabase();

  if (db) {
    // Repeat-trial prevention: one account (one trial) per email.
    const { data: existing } = await db
      .from("app_users")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: "account_exists", message: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }
    const password_hash = await bcrypt.hash(password, 10);
    const { error } = await db.from("app_users").insert({
      email,
      name: name || email,
      password_hash,
      plan: "trial",
      trial_ends_at: trialEndsAt,
    });
    if (error) {
      return NextResponse.json({ error: "db_error", message: error.message }, { status: 500 });
    }
  }
  // If db is null we still issue a trial cookie (no persistence yet).

  const token = await createSession({ email, name: name || email, plan: "trial", trialEndsAt });
  const res = NextResponse.json({ ok: true, trialEndsAt, days: TRIAL_DAYS });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 86400,
  });
  return res;
}
