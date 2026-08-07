"use client";
import { useEffect, useState } from "react";

type Contact = {
  id: string;
  phone: string;
  name: string | null;
};

export default function ContactManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await fetch("/api/chat/contacts");
      const data = await res.json();
      if (res.ok) setContacts(data.contacts || []);
    } catch (e) {
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    try {
      const res = await fetch("/api/chat/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name: name || null }),
      });

      const data = await res.json();
      if (res.ok) {
        setContacts([...contacts, data.contact]);
        setPhone("");
        setName("");
        setShowForm(false);
        setSuccess("Contact added!");
        setTimeout(() => setSuccess(""), 2000);
      } else {
        setError(data.error || "Failed to add contact");
      }
    } catch (e) {
      setError("Error adding contact");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading contacts...</div>;

  return (
    <div className="container-px py-12">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="font-display text-3xl font-bold">Contacts</h1>
          <p className="muted mt-2">Manage your WhatsApp contacts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? "Cancel" : "Add Contact"}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-emerald/20 border border-emerald text-emerald p-3 rounded text-sm">
          {success}
        </div>
      )}

      {showForm && (
        <div className="card p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number (E.164 format)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                className="field"
              />
              <p className="text-xs text-slate-400 mt-1">e.g., +1 (123) 456-7890</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contact name"
                className="field"
              />
            </div>
            <button onClick={addContact} className="btn-primary w-full">
              Add Contact
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {contacts.map((contact) => (
          <div key={contact.id} className="card p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{contact.name || contact.phone}</p>
              <p className="text-xs text-slate-400">{contact.phone}</p>
            </div>
            <button className="text-emerald text-sm hover:underline">
              Start Chat
            </button>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <p className="text-lg">No contacts yet</p>
            <p className="text-sm mt-2">Add a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
