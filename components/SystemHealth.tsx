"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icons";

type Check = {
  id: string;
  label: string;
  configured: boolean;
  required: boolean;
  help: string;
};

type Health = {
  requiredReady: boolean;
  checks: Check[];
  metaApiVersion: string;
  externalMetaChecks: string[];
};

export default function SystemHealth() {
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/system-health", { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error || "Could not load system health.");
        return body;
      })
      .then(setData)
      .catch((e) => setError(e?.message || "Could not load system health."));
  }, []);

  if (error) {
    return <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm">{error}</div>;
  }
  if (!data) return <div className="muted p-4">Checking configuration…</div>;

  const required = data.checks.filter((c) => c.required);
  const optional = data.checks.filter((c) => !c.required);

  return (
    <div className="space-y-8">
      <div className={`rounded-2xl border p-5 ${data.requiredReady ? "border-emerald/40 bg-emerald/[0.06]" : "border-amber-500/40 bg-amber-500/[0.07]"}`}>
        <div className="flex items-start gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${data.requiredReady ? "bg-emerald/10 text-emerald" : "bg-amber-500/10 text-amber-300"}`}>
            {data.requiredReady ? <Icon.check className="h-5 w-5" /> : <Icon.shield className="h-5 w-5" />}
          </span>
          <div>
            <h2 className="font-display text-base font-semibold">
              {data.requiredReady ? "Core server configuration is ready" : "Some required configuration is missing"}
            </h2>
            <p className="muted mt-1 text-sm">
              This page never displays secret values. It only checks whether each required setting exists and whether Firebase can initialize.
            </p>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Required for production</h2>
            <p className="muted mt-1 text-sm">Fix every Missing item before merging the production branch.</p>
          </div>
          <span className="rounded-full border px-3 py-1 text-xs muted" style={{ borderColor: "var(--line)" }}>
            Graph API {data.metaApiVersion}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {required.map((check) => (
            <HealthCard key={check.id} check={check} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Provider-mode configuration</h2>
        <p className="muted mt-1 text-sm leading-relaxed">
          These depend on how Meta approves your Tech Provider / Solution Partner setup. They are not required for a basic manually connected Cloud API account.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {optional.map((check) => (
            <HealthCard key={check.id} check={check} />
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-lg font-semibold">Checks that cannot be proved by environment variables</h2>
        <p className="muted mt-1 text-sm">These must be confirmed inside Meta Business / App Review.</p>
        <ul className="mt-4 space-y-3">
          {data.externalMetaChecks.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <Icon.check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function HealthCard({ check }: { check: Check }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-sm font-semibold">{check.label}</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${check.configured ? "bg-emerald/15 text-emerald" : "bg-amber-500/15 text-amber-300"}`}>
          {check.configured ? "Configured" : "Missing"}
        </span>
      </div>
      <p className="muted mt-2 text-xs leading-relaxed">{check.help}</p>
    </div>
  );
}
