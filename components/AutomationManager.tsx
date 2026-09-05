"use client";

import { useEffect, useState } from "react";

type Rule = {
  id: string;
  name: string;
  enabled: boolean;
  keywords: string[];
  matchMode: "contains" | "exact";
  replyText: string | null;
  addTags: string[];
  runCount: number;
  lastRunAt: string | null;
};

export default function AutomationManager() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    keywords: "",
    matchMode: "contains" as "contains" | "exact",
    replyText: "",
    tags: "",
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/automations", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || "Could not load automations");
      setRules(data.rules || []);
    } catch (e: any) {
      setError(e?.message || "Could not load automations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setBusy("create");
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          keywords: form.keywords.split(",").map((v) => v.trim()).filter(Boolean),
          matchMode: form.matchMode,
          replyText: form.replyText,
          addTags: form.tags.split(",").map((v) => v.trim()).filter(Boolean),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || "Could not create automation");
      setRules((rows) => [data.rule, ...rows]);
      setForm({ name: "", keywords: "", matchMode: "contains", replyText: "", tags: "" });
      setShowCreate(false);
      setSuccess("Automation enabled ✓ It will run on matching inbound WhatsApp messages.");
    } catch (e: any) {
      setError(e?.message || "Could not create automation");
    } finally {
      setBusy(null);
    }
  };

  const toggle = async (rule: Rule) => {
    setBusy(rule.id);
    setError("");
    try {
      const res = await fetch("/api/automations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId: rule.id, enabled: !rule.enabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || "Could not update automation");
      setRules((rows) => rows.map((r) => (r.id === rule.id ? data.rule : r)));
    } catch (e: any) {
      setError(e?.message || "Could not update automation");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="container-px py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">WhatsApp Automations</h1>
          <p className="muted mt-2 max-w-2xl text-sm leading-relaxed">
            Create simple keyword automations for inbound conversations. This is the first production-safe layer of the future visual chatbot/workflow engine.
          </p>
        </div>
        <button onClick={() => setShowCreate((v) => !v)} className="btn-primary">
          {showCreate ? "Cancel" : "New Automation"}
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-emerald/30 bg-emerald/[0.05] p-4">
        <p className="text-sm font-medium">Example</p>
        <p className="muted mt-1 text-xs leading-relaxed">
          Customer sends “price” → platform replies automatically → contact gets tag “Pricing Lead”. Use {"{{name}}"} and {"{{phone}}"} inside the reply for personalization.
        </p>
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
      {success && <div className="mb-5 rounded-xl border border-emerald/30 bg-emerald/[0.06] p-4 text-sm text-emerald">{success}</div>}

      {showCreate && (
        <div className="card mb-8 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Automation name</label>
              <input className="field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Pricing enquiry" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Match type</label>
              <select className="field" value={form.matchMode} onChange={(e) => setForm((f) => ({ ...f, matchMode: e.target.value as "contains" | "exact" }))}>
                <option value="contains">Message contains keyword</option>
                <option value="exact">Exact message match</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium">Keywords</label>
            <input className="field" value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} placeholder="price, pricing, cost, charges" />
            <p className="muted mt-1 text-xs">Separate multiple keywords with commas.</p>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium">Automatic reply</label>
            <textarea className="field min-h-32 resize-y" value={form.replyText} onChange={(e) => setForm((f) => ({ ...f, replyText: e.target.value }))} placeholder="Hi {{name}}, thanks for your message. Our plans start from..." />
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium">Add tags <span className="muted">(optional)</span></label>
            <input className="field" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="Pricing Lead, Hot Lead" />
          </div>

          <button onClick={create} disabled={busy === "create" || !form.name || !form.keywords || !form.replyText} className="btn-primary mt-5 disabled:opacity-50">
            {busy === "create" ? "Creating…" : "Create & Enable"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="card p-10 text-center muted">Loading automations…</div>
      ) : rules.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-medium">No automation rules yet</p>
          <p className="muted mt-2 text-sm">Create a keyword rule to automate your first inbound WhatsApp response.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-semibold">{rule.name}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${rule.enabled ? "bg-emerald/15 text-emerald" : "bg-white/5 muted"}`}>
                      {rule.enabled ? "Enabled" : "Paused"}
                    </span>
                  </div>
                  <p className="muted mt-2 text-xs">{rule.matchMode === "exact" ? "Exact" : "Contains"}: {rule.keywords.join(", ")}</p>
                  <p className="mt-3 whitespace-pre-wrap rounded-xl border p-3 text-sm leading-relaxed" style={{ borderColor: "var(--line)" }}>{rule.replyText}</p>
                  {rule.addTags.length > 0 && <p className="muted mt-2 text-xs">Adds tags: {rule.addTags.join(", ")}</p>}
                  <p className="muted mt-2 text-[11px]">Runs: {rule.runCount || 0}{rule.lastRunAt ? ` · Last run ${new Date(rule.lastRunAt).toLocaleString()}` : ""}</p>
                </div>
                <button disabled={busy === rule.id} onClick={() => toggle(rule)} className="btn-ghost text-xs disabled:opacity-50">
                  {busy === rule.id ? "Saving…" : rule.enabled ? "Pause" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
