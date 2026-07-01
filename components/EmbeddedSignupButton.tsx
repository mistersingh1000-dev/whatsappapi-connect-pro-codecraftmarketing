"use client";
import { useEffect, useState } from "react";
import { Icon } from "./Icons";

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

const APP_ID = process.env.NEXT_PUBLIC_META_APP_ID || "YOUR_META_APP_ID";
const CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID || "YOUR_CONFIG_ID";

export default function EmbeddedSignupButton({ onConnected }: { onConnected?: () => void }) {
  const [status, setStatus] = useState<string>("");
  const [signup, setSignup] = useState<{ waba_id?: string; phone_number_id?: string }>({});
  const ready = APP_ID !== "YOUR_META_APP_ID";

  useEffect(() => {
    if (!ready || window.FB) return;
    window.fbAsyncInit = function () {
      window.FB.init({ appId: APP_ID, autoLogAppEvents: true, xfbml: false, version: "v21.0" });
    };
    const s = document.createElement("script");
    s.src = "https://connect.facebook.net/en_US/sdk.js";
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);

    const onMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith("facebook.com")) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
          setSignup({ waba_id: data.data?.waba_id, phone_number_id: data.data?.phone_number_id });
        }
      } catch {}
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [ready]);

  const save = async (code: string | null) => {
    const res = await fetch("/api/embedded-signup/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, ...signup }),
    });
    if (res.ok) {
      setStatus("Connected ✓ Your WhatsApp number is now linked to your account.");
      onConnected?.();
    } else {
      const d = await res.json().catch(() => ({}));
      setStatus(d.message || "Could not save your number. Please try again.");
    }
  };

  const launch = () => {
    if (!ready || !window.FB) {
      setStatus("Demo mode — add NEXT_PUBLIC_META_APP_ID and NEXT_PUBLIC_META_CONFIG_ID (from your approved Meta app) to go live.");
      return;
    }
    window.FB.login(
      (response: any) => {
        if (response.authResponse?.code) {
          save(response.authResponse.code);
        } else {
          setStatus("Signup was cancelled.");
        }
      },
      {
        config_id: CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {}, featureType: "", sessionInfoVersion: "2" },
      }
    );
  };

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Apply for WhatsApp API</h3>
          <p className="muted mt-1 text-sm">
            One popup connects your Facebook Business, verifies your number, and activates the
            official API — directly with Meta.
          </p>
        </div>
        <button onClick={launch} className="btn-primary shrink-0 bg-[#1877F2] bg-none text-white">
          <Icon.facebook className="h-5 w-5" />
          Continue with Facebook
        </button>
      </div>
      {status && (
        <div className="mt-5 rounded-2xl border border-emerald/30 bg-emerald/[0.06] px-4 py-3 text-sm">
          {status}
        </div>
      )}
      {!ready && (
        <p className="muted mt-4 text-xs">
          Runs in demo mode until your Meta credentials are set. You can test the full flow now with a
          Meta <span className="font-medium">sandbox account</span> — no approval needed.
        </p>
      )}
    </div>
  );
}
