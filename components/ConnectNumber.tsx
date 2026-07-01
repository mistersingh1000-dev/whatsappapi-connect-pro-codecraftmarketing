"use client";
import { useCallback, useEffect, useState } from "react";
import EmbeddedSignupButton from "./EmbeddedSignupButton";
import { Icon } from "./Icons";

type Me = {
  authenticated: boolean;
  connected?: boolean;
  phoneNumberId?: string | null;
  wabaId?: string | null;
};

export default function ConnectNumber() {
  const [me, setMe] = useState<Me | null>(null);
  const [form, setForm] = useState({ phone_number_id: "", waba_id: "", wa_token: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch("/api/auth/me").then((r) => r.json()).then(setMe).catch(() => setMe(null));
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
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Could not connect.");
      setMsg(`Connected ✓ ${d.display || ""}`);
      load();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!me || !me.authenticated) return null;

  if (me.connected) {
    return (
      <div className="mb-6 card p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald/10 text-emerald">
            <Icon.whatsapp className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold">WhatsApp number connected</p>
            <p className="muted mt-0.5 text-xs">
              Phone number ID: <span className="font-mono">{me.phoneNumberId}</span>
            </p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald/12 px-3 py-1.5 text-xs font-medium text-emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Active
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 card p-6 sm:p-8">
      <h3 className="font-display text-lg font-semibold">Apply for WhatsApp API</h3>
      <p className="muted mt-1 text-sm">
        Connect your official WhatsApp Business API number so you can start sending during your trial.
      </p>

      {/* Primary: connect your own Meta credentials (works today) */}
      <form onSubmit={connect} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Phone Number ID</label>
            <input className="field" required value={form.phone_number_id} onChange={upd("phone_number_id")} placeholder="e.g. 5567281930045128" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">WABA ID <span className="muted">(optional)</span></label>
            <input className="field" value={form.waba_id} onChange={upd("waba_id")} placeholder="WhatsApp Business Account ID" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Access token</label>
          <input className="field font-mono" required value={form.wa_token} onChange={upd("wa_token")} placeholder="Permanent or temporary Meta token" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? "Verifying…" : "Connect my number"}
          </button>
          <a
            href="https://developers.facebook.com/apps"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald hover:underline"
          >
            Where do I get these? →
          </a>
        </div>
        {msg && (
          <p className="rounded-xl border border-emerald/30 bg-emerald/[0.06] px-3 py-2.5 text-xs">{msg}</p>
        )}
      </form>

      <details className="mt-5 text-sm">
        <summary className="cursor-pointer muted">How to get your Phone Number ID and token</summary>
        <ol className="muted mt-3 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed">
          <li>Go to developers.facebook.com → create or open your app → add the WhatsApp product.</li>
          <li>Open WhatsApp → API Setup. Copy the <span className="font-mono">Phone number ID</span>.</li>
          <li>Copy the temporary access token shown there (or generate a permanent one via a System User for long-term use).</li>
          <li>Paste both above and click Connect. We verify them with Meta before saving.</li>
        </ol>
      </details>

      {/* Secondary: one-click Embedded Signup (lights up once you're an approved Tech Provider) */}
      <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--line)" }}>
        <p className="muted mb-3 text-xs">Or, one-click onboarding (available once we're an approved Meta Tech Provider):</p>
        <EmbeddedSignupButton onConnected={load} />
      </div>
    </div>
  );
}
