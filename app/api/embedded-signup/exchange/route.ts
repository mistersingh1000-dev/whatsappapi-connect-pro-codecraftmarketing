import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb, updateUser } from "@/lib/db";
import { encryptCredential } from "@/lib/credential-crypto";

export const runtime = "nodejs";

function newRegistrationPin(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

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

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "database_not_configured", message: "Firebase is not configured on the server." },
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

  const registrationPin = newRegistrationPin();
  const saved = await updateUser(db, session.sub, {
    waba_id: String(waba_id),
    phone_number_id: String(phone_number_id),
    wa_token: encryptCredential(accessToken),
    wa_registered: false,
    wa_registration_pin: encryptCredential(registrationPin),
    wa_registration_error: null,
    wa_connected_at: null,
  });
  if (!saved) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  // Meta requires Cloud API phone registration and a 6-digit two-step PIN.
  // Generate and store the PIN server-side so customers do not have to manage
  // another technical credential during onboarding.
  try {
    const registerRes = await fetch(
      `https://graph.facebook.com/${version}/${encodeURIComponent(String(phone_number_id))}/register`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messaging_product: "whatsapp", pin: registrationPin }),
        cache: "no-store",
      }
    );
    const registerData = await registerRes.json().catch(() => ({}));

    if (registerRes.ok && registerData?.success === true) {
      await updateUser(db, session.sub, {
        wa_registered: true,
        wa_registration_error: null,
        wa_connected_at: new Date().toISOString(),
      });

      return NextResponse.json({
        ok: true,
        registered: true,
        waba_id: String(waba_id),
        phone_number_id: String(phone_number_id),
      });
    }

    const message =
      registerData?.error?.message ||
      "Meta signup completed, but the final phone registration step is still pending.";
    await updateUser(db, session.sub, {
      wa_registered: false,
      wa_registration_error: String(message).slice(0, 500),
    });

    return NextResponse.json(
      {
        ok: true,
        registered: false,
        needsRegistration: true,
        message,
        waba_id: String(waba_id),
        phone_number_id: String(phone_number_id),
      },
      { status: 202 }
    );
  } catch {
    const message = "Meta signup completed, but the final phone registration request could not be completed.";
    await updateUser(db, session.sub, {
      wa_registered: false,
      wa_registration_error: message,
    });
    return NextResponse.json(
      {
        ok: true,
        registered: false,
        needsRegistration: true,
        message,
        waba_id: String(waba_id),
        phone_number_id: String(phone_number_id),
      },
      { status: 202 }
    );
  }
}
