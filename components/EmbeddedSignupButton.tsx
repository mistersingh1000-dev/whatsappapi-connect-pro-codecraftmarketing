"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

const APP_ID = process.env.NEXT_PUBLIC_META_APP_ID || "YOUR_META_APP_ID";
const CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID || "YOUR_CONFIG_ID";
const GRAPH_VERSION = process.env.NEXT_PUBLIC_META_GRAPH_VERSION || "v26.0";

export default function EmbeddedSignupButton({ onConnected }: { onConnected?: () => void }) {
  const [status, setStatus] = useState<string>("");
  const codeRef = useRef<string | null>(null);
  const signupRef = useRef<{ waba_id?: string; phone_number_id?: string }>({});
  const submittingRef = useRef(false);

  const ready =
    APP_ID !== "YOUR_META_APP_ID" &&
    CONFIG_ID !== "YOUR_CONFIG_ID" &&
    Boolean(APP_ID) &&
    Boolean(CONFIG_ID);

  const saveIfReady = useCallback(async () => {
    const code = codeRef.current;
    const { waba_id, phone_number_id } = signupRef.current;

    // Meta returns the authorization code and WA_EMBEDDED_SIGNUP FINISH event
    // independently. Wait until both have arrived before calling the backend.
    if (!code || !waba_id || !phone_number_id || submittingRef.current) return;

    submittingRef.current = true;
    setStatus("Finishing your WhatsApp connection…");

    try {
      const res = await fetch("/api/embedded-signup/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, waba_id, phone_number_id }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus(
          data?.message ||
            "Meta completed signup, but the API provisioning step failed. Please check the Meta configuration and try again."
        );
        return;
      }

      if (data?.registered === true) {
        setStatus("Connected ✓ Meta signup, webhook subscription and phone registration are complete.");
      } else if (data?.needsRegistration) {
        setStatus(
          data?.message ||
            "Meta signup is complete, but final phone activation is still pending. Your dashboard will show the current status."
        );
      } else {
        setStatus("Meta signup completed. Checking activation status in your dashboard…");
      }
      onConnected?.();
    } catch {
      setStatus("Could not reach the server to finish setup. Please try again.");
    } finally {
      submittingRef.current = false;
    }
  }, [onConnected]);

  useEffect(() => {
    if (!ready) return;

    window.fbAsyncInit = function () {
      window.FB?.init({
        appId: APP_ID,
        autoLogAppEvents: true,
        xfbml: false,
        version: GRAPH_VERSION,
      });
    };

    if (!window.FB && !document.getElementById("facebook-jssdk")) {
      const s = document.createElement("script");
      s.id = "facebook-jssdk";
      s.src = "https://connect.facebook.net/en_US/sdk.js";
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    } else if (window.FB) {
      window.fbAsyncInit?.();
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.facebook.com") return;

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type !== "WA_EMBEDDED_SIGNUP") return;

        if (data?.event === "FINISH") {
          const waba_id = data?.data?.waba_id;
          const phone_number_id = data?.data?.phone_number_id;
          if (waba_id && phone_number_id) {
            signupRef.current = { waba_id, phone_number_id };
            void saveIfReady();
          } else {
            setStatus("Meta finished signup but did not return the WhatsApp account IDs. Please retry.");
          }
        } else if (data?.event === "CANCEL") {
          setStatus("Signup was cancelled before completion.");
        } else if (data?.event === "ERROR") {
          setStatus(data?.data?.error_message || "Meta reported an Embedded Signup error.");
        }
      } catch {
        // Ignore unrelated postMessage traffic.
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [ready, saveIfReady]);

  const launch = () => {
    if (!ready || !window.FB) {
      setStatus(
        "One-click signup is not configured yet. Add the Meta App ID and Embedded Signup Configuration ID in Vercel."
      );
      return;
    }

    codeRef.current = null;
    signupRef.current = {};
    submittingRef.current = false;
    setStatus("Opening Meta Embedded Signup…");

    window.FB.login(
      (response: any) => {
        if (response?.authResponse?.code) {
          codeRef.current = response.authResponse.code;
          void saveIfReady();
        } else {
          setStatus("Signup was cancelled or Meta did not return an authorization code.");
        }
      },
      {
        config_id: CONFIG_ID,
        auth_type: "rerequest",
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {} },
      }
    );
  };

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Connect with Meta</h3>
          <p className="muted mt-1 text-sm">
            The Meta-hosted flow lets the customer choose the correct Business Portfolio,
            WhatsApp Business Account and phone number without copying API credentials.
          </p>
        </div>
        <button
          onClick={launch}
          disabled={!ready}
          title={ready ? undefined : "Meta Embedded Signup is not configured yet"}
          className="btn-primary shrink-0 bg-[#1877F2] bg-none text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
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
        <div className="mt-5 rounded-2xl border border-amber-500/40 bg-amber-500/[0.07] px-4 py-3">
          <p className="text-sm font-semibold text-amber-300">One-click signup needs Meta setup</p>
          <p className="muted mt-1.5 text-sm leading-relaxed">
            Add NEXT_PUBLIC_META_APP_ID and NEXT_PUBLIC_META_CONFIG_ID in Vercel after creating the
            Facebook Login for Business / Embedded Signup configuration. Manual Cloud API
            credentials can still be connected while Meta App Review is pending.
          </p>
        </div>
      )}
    </div>
  );
}
