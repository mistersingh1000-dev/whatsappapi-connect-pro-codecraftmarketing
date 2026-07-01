"use client";
import { useState } from "react";
import { Icon } from "./Icons";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [intent, setIntent] = useState<"demo" | "sales">("demo");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wire this to your backend / email service / CRM, e.g.:
    // await fetch("/api/contact", { method: "POST", body: JSON.stringify({ ...form, intent }) });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="card flex flex-col items-center gap-3 p-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald/15 text-emerald">
          <Icon.check className="h-7 w-7" />
        </span>
        <h3 className="font-display text-xl font-semibold">Thanks, {form.name || "there"}!</h3>
        <p className="muted max-w-sm text-sm">
          Our team will reach out within one business day. For anything urgent, tap the WhatsApp
          button to chat with us live.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8">
      <div className="mb-5 inline-flex rounded-full border p-1" style={{ borderColor: "var(--line)" }}>
        {(["demo", "sales"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setIntent(opt)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              intent === opt ? "bg-emerald text-ink" : "muted"
            }`}
          >
            {opt === "demo" ? "Request demo" : "Contact sales"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input className="field" placeholder="Full name" required value={form.name} onChange={update("name")} />
        <input className="field" type="email" placeholder="Work email" required value={form.email} onChange={update("email")} />
        <input className="field" placeholder="Phone number" value={form.phone} onChange={update("phone")} />
        <input className="field" placeholder="Company name" value={form.company} onChange={update("company")} />
      </div>
      <textarea
        className="field mt-4 min-h-[120px] resize-none"
        placeholder={intent === "demo" ? "Tell us about your use case…" : "What can our sales team help with?"}
        value={form.message}
        onChange={update("message")}
      />
      <button type="submit" className="btn-primary mt-5 w-full sm:w-auto">
        {intent === "demo" ? "Request demo" : "Contact sales"}
        <Icon.arrow className="h-4 w-4" />
      </button>
    </form>
  );
}
