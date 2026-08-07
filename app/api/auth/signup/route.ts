import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, createSession, newTrialEnd, TRIAL_DAYS } from "@/lib/auth";
import { getDb, findUser, createUser, normEmail } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { name, email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const cleanEmail = normEmail(email);
  const trialEndsAt = newTrialEnd();
  const db = getDb();

  if (db) {
    // Repeat-trial prevention: one account (one trial) per email.
    const existing = await findUser(db, cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: "account_exists", message: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }
    const password_hash = await bcrypt.hash(password, 10);
    try {
      await createUser(db, {
        email: cleanEmail,
        name: name || cleanEmail,
        password_hash,
        plan: "trial",
        trial_ends_at: trialEndsAt,
        waba_id: null,
        phone_number_id: null,
        wa_token: null,
        created_at: new Date().toISOString(),
      });
    } catch (e: any) {
      return NextResponse.json(
        { error: "db_error", message: e?.message || "Could not create the account." },
        { status: 500 }
      );
    }
  }
  // If db is null we still issue a trial cookie (no persistence yet).

  const token = await createSession({ email: cleanEmail, name: name || cleanEmail, plan: "trial", trialEndsAt });
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
