"use client";
import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  trial_ends_at: string;
  phone_number_id: string | null;
  waba_id: string | null;
  created_at: string;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ plan: "trial", trial_ends_at: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
      else setMsg(data.error || "Failed to load users");
    } catch {
      setMsg("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user: User) => {
    setEditingEmail(user.email);
    setEditForm({ plan: user.plan, trial_ends_at: user.trial_ends_at.split("T")[0] });
    setMsg("");
  };

  const save = async () => {
    if (!editingEmail) return;
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(editingEmail)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: editForm.plan,
          trial_ends_at: new Date(editForm.trial_ends_at).toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Updated ✓");
        setEditingEmail(null);
        load();
      } else {
        setMsg(data.error || "Update failed");
      }
    } catch {
      setMsg("Error saving");
    }
  };

  if (loading) return <div className="p-6">Loading users...</div>;

  return (
    <section className="container-px py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
        <p className="muted mt-2">Manage all customer accounts, plans, and subscriptions</p>
      </div>

      {msg && <div className="mb-4 rounded-xl border border-emerald/30 bg-emerald/[0.06] px-4 py-3 text-sm">{msg}</div>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Plan</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Trial Ends</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">WhatsApp</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-line hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-sm font-mono">{user.email}</td>
                <td className="px-4 py-3 text-sm"><span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-emerald/20 text-emerald">{user.plan}</span></td>
                <td className="px-4 py-3 text-sm">{new Date(user.trial_ends_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm">{user.phone_number_id ? "✓" : "—"}</td>
                <td className="px-4 py-3"><button onClick={() => startEdit(user)} className="text-sm text-emerald hover:underline">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingEmail && (
        <div className="mt-8 card p-6">
          <h2 className="font-display text-lg font-semibold">Edit: {editingEmail}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Plan</label>
              <select className="field" value={editForm.plan} onChange={(e) => setEditForm((f) => ({ ...f, plan: e.target.value }))}>
                <option value="trial">Trial</option>
                <option value="paid">Paid</option>
                <option value="free">Free</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Trial Ends</label>
              <input type="date" className="field" value={editForm.trial_ends_at} onChange={(e) => setEditForm((f) => ({ ...f, trial_ends_at: e.target.value }))} />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={save} className="btn-primary">Save</button>
            <button onClick={() => setEditingEmail(null)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}