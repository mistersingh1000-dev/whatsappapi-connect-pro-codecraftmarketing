"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Contact = {
  id: string;
  phone: string;
  name: string | null;
  tags?: string[];
  marketingOptIn?: boolean;
  optInSource?: string | null;
  doNotMessage?: boolean;
};

export default function ContactManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [readOnly, setReadOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const optedInCount = useMemo(
    () => contacts.filter((c) => c.marketingOptIn === true && c.doNotMessage !== true).length,
    [contacts]
  );

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chat/contacts", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to load contacts");
      setContacts(data.contacts || []);
      setReadOnly(data.readOnly === true);
    } catch (e: any) {
      setError(e?.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    if (readOnly) return;
    setError("");
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    try {
      const res = await fetch("/api/chat/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name: name || null,
          marketingOptIn,
          optInSource: marketingOptIn ? "owner-confirmed consent" : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to add contact");

      setContacts((rows) => [data.contact, ...rows.filter((c) => c.id !== data.contact.id)]);
      setPhone("");
      setName("");
      setMarketingOptIn(false);
      setShowForm(false);
      setSuccess("Contact saved ✓");
      window.setTimeout(() => setSuccess(""), 2500);
    } catch (e: any) {
      setError(e?.message || "Error adding contact");
    }
  };

  const setConsent = async (contact: Contact, value: boolean) => {
    if (readOnly) return;
    setSavingId(contact.id);
    setError("");
    try {
      const res = await fetch("/api/chat/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          marketingOptIn: value,
          optInSource: value ? "owner-confirmed consent" : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || "Could not update consent");
      setContacts((rows) => rows.map((c) => (c.id === contact.id ? data.contact : c)));
    } catch (e: any) {
      setError(e?.message || "Could not update consent");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="p-10 text-center muted">Loading contacts…</div>;

  return (
    <div className="container-px py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Contacts & Consent</h1>
          <p className="muted mt-2 max-w-2xl text-sm leading-relaxed">
            Manage customer numbers and clearly record who has permission to receive WhatsApp marketing campaigns.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--line)" }}>{contacts.length} total contacts</span>
            <span className="rounded-full bg-emerald/12 px-3 py-1.5 text-emerald">{optedInCount} marketing opted-in</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/campaigns" className="btn-ghost">Campaigns</Link>
          {!readOnly && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? "Cancel" : "Add Contact"}</button>
          )}
        </div>
      </div>

      {readOnly && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-amber-200">Contacts are read-only</p>
            <p className="muted mt-1 text-xs">Your CRM data and consent history stay saved. Subscribe or renew to add/edit contacts and run campaigns.</p>
          </div>
          <Link href="/pricing" className="btn-primary shrink-0 text-xs">Choose subscription</Link>
        </div>
      )}

      {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
      {success && <div className="mb-4 rounded-xl border border-emerald/30 bg-emerald/[0.06] p-3 text-sm text-emerald">{success}</div>}

      {showForm && !readOnly && (
        <div className="card mb-8 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Phone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+919876543210" className="field" />
              <p className="muted mt-1 text-xs">Use international format.</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" className="field" />
            </div>
          </div>

          <label className="mt-5 flex items-start gap-3 rounded-2xl border p-4" style={{ borderColor: "var(--line)" }}>
            <input type="checkbox" checked={marketingOptIn} onChange={(e) => setMarketingOptIn(e.target.checked)} className="mt-1" />
            <span>
              <span className="block text-sm font-medium">Customer has agreed to receive WhatsApp marketing messages</span>
              <span className="muted mt-1 block text-xs leading-relaxed">Only enable this when you have a valid opt-in/consent record. Campaigns automatically exclude contacts without consent.</span>
            </span>
          </label>

          <button onClick={addContact} className="btn-primary mt-5 w-full sm:w-auto">Save Contact</button>
        </div>
      )}

      <div className="space-y-3">
        {contacts.map((contact) => {
          const eligible = contact.marketingOptIn === true && contact.doNotMessage !== true;
          return (
            <div key={contact.id} className="card p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium">{contact.name || contact.phone}</p>
                  <p className="muted mt-0.5 font-mono text-xs">{contact.phone}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${eligible ? "bg-emerald/15 text-emerald" : "bg-amber-500/15 text-amber-300"}`}>
                      {eligible ? "Marketing opt-in ✓" : "Not eligible for campaigns"}
                    </span>
                    {contact.doNotMessage && <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-medium text-red-300">Do not message</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!readOnly && !contact.doNotMessage && (
                    <button disabled={savingId === contact.id} onClick={() => setConsent(contact, !eligible)} className="btn-ghost text-xs disabled:opacity-50">
                      {savingId === contact.id ? "Saving…" : eligible ? "Remove marketing opt-in" : "Confirm marketing opt-in"}
                    </button>
                  )}
                  <Link href="/dashboard/chat" className="btn-ghost text-xs">Open Inbox</Link>
                </div>
              </div>
            </div>
          );
        })}

        {contacts.length === 0 && (
          <div className="card p-12 text-center"><p className="text-lg font-medium">No contacts yet</p><p className="muted mt-2 text-sm">Add a contact or receive an inbound WhatsApp conversation.</p></div>
        )}
      </div>
    </div>
  );
}
