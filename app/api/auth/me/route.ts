import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession, trialDaysLeft } from "@/lib/auth";
import { getSupabase, type AppUser } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ authenticated: false });

  let plan = session.plan;
  let trialEndsAt = session.trialEndsAt;
  let phoneNumberId: string | null = null;
  let wabaId: string | null = null;

  const db = getSupabase();
  if (db) {
    const { data: user } = await db
      .from("app_users")
      .select("plan,trial_ends_at,name,waba_id,phone_number_id")
      .eq("email", session.sub)
      .maybeSingle<AppUser>();
    if (user) {
      plan = user.plan;
      trialEndsAt = user.trial_ends_at;
      phoneNumberId = user.phone_number_id;
      wabaId = user.waba_id;
    }
  }

  const daysLeft = trialDaysLeft(trialEndsAt);
  const readOnly = plan !== "paid" && daysLeft <= 0;

  return NextResponse.json({
    authenticated: true,
    name: session.name,
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
