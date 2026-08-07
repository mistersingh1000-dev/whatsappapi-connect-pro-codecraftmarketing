"use client";
import { useState } from "react";
import { Icon, type IconName } from "./Icons";

const nav: { id: string; label: string; icon: IconName }[] = [
  { id: "overview", label: "Overview", icon: "chart" },
  { id: "campaigns", label: "Campaigns", icon: "rocket" },
  { id: "templates", label: "Templates", icon: "report" },
  { id: "contacts", label: "Contacts", icon: "inbox" },
  { id: "api", label: "API Credentials", icon: "key" },
  { id: "settings", label: "Settings", icon: "shield" },
];

const kpis = [
  { label: "Messages sent", value: "1,28,540", delta: "+12.4%" },
  { label: "Delivered", value: "99.2%", delta: "+0.3%" },
  { label: "Read rate", value: "74.6%", delta: "+5.1%" },
  { label: "Active campaigns", value: "6", delta: "2 live" },
];

const bars = [42, 60, 38, 75, 90, 64, 88, 72, 96, 80, 110, 95];
const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const reports = [
  { name: "Diwali Sale Broadcast", sent: 24500, status: "Completed", rate: "98.7%" },
  { name: "OTP — Login", sent: 61230, status: "Live", rate: "99.6%" },
  { name: "Abandoned Cart", sent: 8420, status: "Completed", rate: "96.2%" },
  { name: "Order Updates", sent: 18900, status: "Live", rate: "99.1%" },
];

const templates = [
  { name: "order_update", cat: "Utility", lang: "en", status: "Approved" },
  { name: "diwali_sale", cat: "Marketing", lang: "en", status: "Approved" },
  { name: "login_otp", cat: "Authentication", lang: "en", status: "Approved" },
  { name: "delivery_eta", cat: "Utility", lang: "hi", status: "Pending" },
];

const creds = [
  { k: "WABA ID", v: "1029384756120394" },
  { k: "Phone Number ID", v: "5567281930045128" },
  { k: "Access Token", v: "EAAG••••••••••••••••••••••••wZDZD" },
  { k: "Webhook URL", v: "https://yourapp.com/api/webhook" },
];

export default function DashboardDemo() {
  const [active, setActive] = useState("overview");

  return (
    <div className="overflow-hidden rounded-3xl border shadow-card" style={{ borderColor: "var(--line)" }}>
      <div className="grid lg:grid-cols-[230px_1fr]">
        {/* Sidebar */}
        <aside className="border-b p-4 lg:border-b-0 lg:border-r" style={{ borderColor: "var(--line)" }}>
          <div className="mb-5 flex items-center gap-2.5 px-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#2ee06f] to-[#075E54]">
              <Icon.whatsapp className="h-4 w-4 text-white" />
            </span>
            <span className="font-display text-sm font-bold">Connect Pro</span>
          </div>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {nav.map((n) => {
              const Glyph = Icon[n.icon];
              const on = active === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setActive(n.id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    on ? "bg-emerald/12 text-emerald" : "muted hover:bg-emerald/5"
                  }`}
                >
                  <Glyph className="h-[18px] w-[18px]" />
                  {n.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <div className="bg-ink-soft p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs muted">Connected number</p>
              <p className="font-display text-lg font-semibold">
                +91 90000 00000 <span className="ml-2 align-middle text-xs font-medium text-emerald">● connected</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/12 px-3 py-1.5 text-xs font-medium text-emerald">
              <Icon.shield className="h-3.5 w-3.5" /> Quality: High
            </span>
          </div>

          {active === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((k) => (
                  <div key={k.label} className="card p-4">
                    <p className="text-xs muted">{k.label}</p>
                    <p className="mt-1.5 font-display text-2xl font-bold">{k.value}</p>
                    <p className="mt-1 text-xs text-emerald">{k.delta}</p>
                  </div>
                ))}
              </div>
              <div className="card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-display text-sm font-semibold">Messages — last 12 months</p>
                  <span className="text-xs muted">in thousands</span>
                </div>
                <div className="flex h-40 items-end gap-2">
                  {bars.map((b, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-emerald/40 to-emerald transition-all"
                        style={{ height: `${(b / 110) * 100}%` }}
                      />
                      <span className="text-[10px] muted">{months[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(active === "campaigns" || active === "overview") && (
            <div className={active === "overview" ? "mt-6" : ""}>
              <p className="mb-3 font-display text-sm font-semibold">Delivery reports</p>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="muted text-xs uppercase tracking-wider">
                      <tr className="border-b" style={{ borderColor: "var(--line)" }}>
                        <th className="px-4 py-3 font-medium">Campaign</th>
                        <th className="px-4 py-3 font-medium">Sent</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Delivered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((r) => (
                        <tr key={r.name} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                          <td className="px-4 py-3 font-medium">{r.name}</td>
                          <td className="px-4 py-3 muted">{r.sent.toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "Live" ? "bg-emerald/15 text-emerald" : "bg-tick/15 text-tick"}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 muted">{r.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {active === "templates" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((t) => (
                <div key={t.name} className="card p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm font-semibold">{t.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${t.status === "Approved" ? "bg-emerald/15 text-emerald" : "bg-tick/15 text-tick"}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="muted mt-2 text-xs">{t.cat} · {t.lang.toUpperCase()}</p>
                </div>
              ))}
            </div>
          )}

          {active === "contacts" && (
            <div className="card p-6 text-center">
              <p className="font-display text-3xl font-bold">48,219</p>
              <p className="muted mt-1 text-sm">opted-in contacts across 14 segments</p>
              <div className="mx-auto mt-5 grid max-w-md grid-cols-2 gap-3 text-left text-sm sm:grid-cols-3">
                {["VIP", "New", "Cart", "Repeat", "Cold", "Wholesale"].map((s) => (
                  <span key={s} className="rounded-full border px-3 py-1.5 text-center text-xs muted" style={{ borderColor: "var(--line)" }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {active === "api" && (
            <div className="card divide-y p-1" style={{ borderColor: "var(--line)" }}>
              {creds.map((c) => (
                <div key={c.k} className="flex items-center justify-between gap-4 px-4 py-3.5" style={{ borderColor: "var(--line)" }}>
                  <span className="text-sm muted">{c.k}</span>
                  <code className="truncate font-mono text-xs sm:text-sm">{c.v}</code>
                </div>
              ))}
            </div>
          )}

          {active === "settings" && (
            <div className="card p-6">
              <p className="font-display text-sm font-semibold">Account settings</p>
              <p className="muted mt-2 text-sm">Display name, profile photo, business hours, and webhook configuration live here. Demo view.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
