import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb, updateUser } from "@/lib/db";
import { encryptCredential } from "@/lib/credential-crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const { code, waba_id, phone_number_id } = await req.json().catch(() => ({}));
  if (!code || !waba_id || !phone_number_id) {
    return NextResponse.json(
      { error: "missing_signup_result", message: "Meta signup did not return all required values. Please try again." },
      { status: 400 }
    );
  }

  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const version = process.env.WHATSAPP_API_VERSION || "v26.0";
  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: "meta_not_configured", message: "Meta Embedded Signup is not configured on the server." },
      { status: 503 }
    );
  }

  let accessToken = "";
  try {
    const tokenRes = await fetch(
      `https://graph.facebook.com/${version}/oauth/access_token?client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&code=${encodeURIComponent(String(code))}`,
      { cache: "no-store" }
    );
    const tokenData = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenData?.access_token) {
      return NextResponse.json(
        { error: "token_exchange_failed", message: tokenData?.error?.message || "Meta could not finish authorization." },
        { status: 502 }
      );
    }
    accessToken = tokenData.access_token;
  } catch {
    return NextResponse.json(
      { error: "meta_unreachable", message: "Could not reach Meta to finish authorization." },
      { status: 502 }
    );
  }

  try {
    const verifyRes = await fetch(
      `https://graph.facebook.com/${version}/${encodeURIComponent(String(phone_number_id))}?fields=id,display_phone_number,verified_name`,
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
    );
    const verifyData = await verifyRes.json().catch(() => ({}));
    if (!verifyRes.ok || String(verifyData?.id || "") !== String(phone_number_id)) {
      return NextResponse.json(
        { error: "asset_verification_failed", message: verifyData?.error?.message || "Meta could not verify the connected phone number." },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "asset_verification_failed", message: "Could not verify the connected WhatsApp number." },
      { status: 502 }
    );
  }

  try {
    const subscribeRes = await fetch(
      `https://graph.facebook.com/${version}/${encodeURIComponent(String(waba_id))}/subscribed_apps`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }
    );
    const subscribeData = await subscribeRes.json().catch(() => ({}));
    if (!subscribeRes.ok) {
      return NextResponse.json(
        { error: "webhook_subscription_failed", message: subscribeData?.error?.message || "Could not enable webhook events for this WhatsApp account." },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "webhook_subscription_failed", message: "Could not enable webhook events for this WhatsApp account." },
      { status: 502 }
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "database_not_configured", message: "Firebase is not configured on the server." },
      { status: 503 }
    );
  }

  const updated = await updateUser(db, session.sub, {
    waba_id: String(waba_id),
    phone_number_id: String(phone_number_id),
    wa_token: encryptCredential(accessToken),
    wa_registered: false,
  });
  if (!updated) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    waba_id: String(waba_id),
    phone_number_id: String(phone_number_id),
    needsRegistration: true,
  });
}
