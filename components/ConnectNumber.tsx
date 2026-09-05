"use client";

import { useCallback, useEffect, useState } from "react";
import EmbeddedSignupButton from "./EmbeddedSignupButton";
import { Icon } from "./Icons";

type Me = {
  authenticated: boolean;
  connected?: boolean;
  activationPending?: boolean;
  phoneNumberId?: string | null;
  wabaId?: string | null;
};

export default function ConnectNumber() {
  const [me, setMe] = useState<Me | null>(null);
  const [form, setForm] = useState({ phone_number_id: "", waba_id: "", wa_token: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  useEffect(() => load(), [load]);

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const connect = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/whatsapp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || "Could not connect.");
      setForm({ phone_number_id: "", waba_id: "", wa_token: "" });
      setMsg(`Connected ✓ ${d.display || "Credentials verified with Meta."}`);
      load();
    } catch (err: any) {
      setMsg(err?.message || "Could not connect.");
    } finally {
      setBusy(false);
    }
  };

  if (!me || !me.authenticated) return null;

  if (me.connected) {
    return (
      <div className="mb-6 card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald/10 text-emerald">
            <Icon.whatsapp className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold">WhatsApp connection active</p>
            <p className="muted mt-0.5 truncate text-xs">
              Phone Number ID: <span className="font-mono">{me.phoneNumberId}</span>
            </p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald/12 px-3 py-1.5 text-xs font-medium text-emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Connected
          </span>
        </div>
      </div>
    );
  }

  if (me.activationPending) {
    return (
      <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/[0.07] p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-300">
            <Icon.whatsapp className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-amber-200">Meta signup completed — activation pending</p>
            <p className="muted mt-1 text-sm leading-relaxed">
              Your WhatsApp assets were returned by Meta, but the final Cloud API registration step
              is not complete yet. Do not repeat signup unless support asks you to.
            </p>
            <p className="muted mt-2 text-xs">
              Phone Number ID: <span className="font-mono">{me.phoneNumberId}</span>
            </p>
            <a href="/contact" className="mt-4 inline-flex text-sm font-medium text-emerald hover:underline">
              Get activation help →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 card p-6 sm:p-8">
      <div>
        <p className="eyebrow">Recommended</p>
        <h3 className="font-display mt-3 text-lg font-semibold">Connect with Meta Embedded Signup</h3>
        <p className="muted mt-1 text-sm leading-relaxed">
          Use the Meta-hosted onboarding flow so the customer can choose the correct Business
          Portfolio, WhatsApp Business Account and phone number without copying API credentials.
        </p>
      </div>

      <div className="mt-5">
        <EmbeddedSignupButton onConnected={load} />
      </div>

      <details className="mt-6 rounded-2xl border p-5" style={{ borderColor: "var(--line)" }}>
        <summary className="cursor-pointer text-sm font-medium">
          Advanced: connect existing Cloud API credentials manually
        </summary>
        <p className="muted mt-3 text-xs leading-relaxed">
          Use this only when you already have a valid Phone Number ID and access token from Meta.
          The server validates the token against Meta before saving it.
        </p>

        <form onSubmit={connect} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Phone Number ID</label>
              <input
                className="field"
                required
                value={form.phone_number_id}
                onChange={upd("phone_number_id")}
                placeholder="Meta Phone Number ID"
                inputMode="numeric"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                WABA ID <span className="muted">(recommended)</span>
              </label>
              <input
                className="field"
                value={form.waba_id}
                onChange={upd("waba_id")}
                placeholder="WhatsApp Business Account ID"
                inputMode="numeric"
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Access token</label>
            <input
              type="password"
              className="field font-mono"
              required
              value={form.wa_token}
              onChange={upd("wa_token")}
              placeholder="Paste Meta access token"
              autoComplete="new-password"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
              {busy ? "Verifying with Meta…" : "Verify & connect"}
            </button>
            <a href="/api-setup" className="text-sm text-emerald hover:underline">
              Open setup guide →
            </a>
          </div>

          {msg && (
            <p className="rounded-xl border border-emerald/30 bg-emerald/[0.06] px-3 py-2.5 text-xs">
              {msg}
            </p>
          )}
        </form>
      </details>
    </div>
  );
}
