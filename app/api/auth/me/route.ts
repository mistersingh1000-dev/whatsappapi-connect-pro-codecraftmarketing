import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession, trialDaysLeft } from "@/lib/auth";
import { getDb, findUser } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ authenticated: false });

  let plan = session.plan as string;
  let trialEndsAt = session.trialEndsAt;
  let phoneNumberId: string | null = null;
  let wabaId: string | null = null;
  let name = session.name;

  const db = getDb();
  if (db) {
    const user = await findUser(db, session.sub);
    if (user) {
      plan = user.plan;
      trialEndsAt = user.trial_ends_at;
      phoneNumberId = user.phone_number_id;
      wabaId = user.waba_id;
      name = user.name || name;
    }
  }

  if (plan === "suspended") {
    return NextResponse.json({ authenticated: false, suspended: true });
  }

  const daysLeft = trialDaysLeft(trialEndsAt);
  const readOnly = plan !== "paid" && daysLeft <= 0;

  return NextResponse.json({
    authenticated: true,
    name,
    email: session.sub,
    plan: readOnly ? "expired" : plan,
    trialEndsAt,
    daysLeft,
    readOnly,
    connected: !!phoneNumberId,
    phoneNumberId,
    wabaId,
  });
}
