"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icons";

type Me =
  | { authenticated: false }
  | {
      authenticated: true;
      name: string;
      plan: string;
      trialEndsAt: string;
      daysLeft: number;
      readOnly: boolean;
    };

export default function TrialBanner() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ authenticated: false }));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (!me) return null;

  if (!me.authenticated) {
    return (
      <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-emerald/30 bg-emerald/[0.06] px-5 py-4 sm:flex-row sm:items-center">
        <p className="text-sm">
          You're viewing the <span className="font-semibold">demo dashboard</span>. Start a free
          trial to connect your own number and send live messages.
        </p>
        <a href="/signup" className="btn-primary shrink-0 h-9 px-4 py-0 text-xs">Start free trial</a>
      </div>
    );
  }

  if (me.readOnly || me.plan === "expired") {
    return (
      <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-tick/40 bg-tick/[0.06] px-5 py-4 sm:flex-row sm:items-center">
        <p className="flex items-center gap-2 text-sm">
          <Icon.shield className="h-4 w-4 text-tick" />
          Your free trial has ended — the dashboard is <span className="font-semibold">read-only</span>.
          Upgrade to reconnect your number and keep sending.
        </p>
        <div className="flex shrink-0 gap-2">
          <a href="/pricing" className="btn-primary h-9 px-4 py-0 text-xs">Upgrade now</a>
          <button onClick={logout} className="btn-ghost h-9 px-4 py-0 text-xs">Log out</button>
        </div>
      </div>
    );
  }

  const low = me.daysLeft <= 2;
  return (
    <div
      className={`mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center ${
        low ? "border-tick/40 bg-tick/[0.06]" : "border-emerald/30 bg-emerald/[0.06]"
      }`}
    >
      <p className="flex items-center gap-2 text-sm">
        <Icon.bolt className={`h-4 w-4 ${low ? "text-tick" : "text-emerald"}`} />
        Hi {me.name.split(" ")[0]} — your free trial has{" "}
        <span className="font-semibold">{me.daysLeft} day{me.daysLeft === 1 ? "" : "s"}</span> left.
        {low && " Upgrade to keep your number connected."}
      </p>
      <div className="flex shrink-0 gap-2">
        <a href="/pricing" className="btn-primary h-9 px-4 py-0 text-xs">Upgrade</a>
        <button onClick={logout} className="btn-ghost h-9 px-4 py-0 text-xs">Log out</button>
      </div>
    </div>
  );
}
