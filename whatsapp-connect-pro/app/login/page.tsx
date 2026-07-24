"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icons";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const expired = params.get("expired") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setMsg(data.message || "Login failed.");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#2ee06f] to-[#075E54] shadow-glow">
          <Icon.whatsapp className="h-6 w-6 text-white" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold">Welcome back</h1>
        <p className="muted mt-2 text-sm">Log in to your WhatsApp Connect Pro dashboard.</p>
      </div>

      {expired && (
        <div className="mb-4 rounded-2xl border border-tick/40 bg-tick/[0.06] px-4 py-3 text-sm">
          Your free trial has ended and you've been disconnected. Upgrade to a paid plan to
          reconnect your number.
        </div>
      )}

      <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <input className="field" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button type="submit" className="btn-primary w-full">Log in to dashboard</button>
        {msg && (
          <p className="rounded-xl border border-emerald/30 bg-emerald/[0.06] px-3 py-2.5 text-xs">{msg}</p>
        )}
      </form>

      <p className="muted mt-5 text-center text-sm">
        New here?{" "}
        <Link href="/signup" className="font-medium text-emerald hover:underline">Start your 7-day free trial</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <section className="container-px grid min-h-[80vh] place-items-center py-16">
      <Suspense fallback={null}>
        <LoginInner />
      </Suspense>
    </section>
  );
}
