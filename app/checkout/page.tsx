"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { plans, site } from "@/lib/site";
import { Icon } from "@/components/Icons";

function Checkout() {
  const router = useRouter();
  const params = useSearchParams();
  const planId = params.get("plan") || "";
  const plan = plans.find((p) => p.id === planId);

  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!plan) {
    return (
      <div className="container-px py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Plan not found</h1>
        <p className="muted mt-3 text-sm">Pick a plan from the pricing page to continue.</p>
        <Link href="/pricing" className="btn-primary mt-6 inline-flex">
          See pricing
        </Link>
      </div>
    );
  }

  async function submit() {
    const ref = reference.trim();
    if (ref.length < 6) {
      setError("Please enter the transaction / UTR number shown in your payment app.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan!.id, reference: ref, note }),
      });
      const data = await res.json();

      if (res.status === 401) {
        router.push(`/signup?next=/checkout?plan=${plan!.id}`);
        return;
      }
      if (!res.ok) {
        setError(data?.message || "Could not submit your payment. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function copyUpi() {
    navigator.clipboard?.writeText(site.upiId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  if (done) {
    return (
      <div className="container-px py-20">
        <div className="card mx-auto max-w-lg p-10 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald/15 text-emerald">
            <Icon.check className="h-7 w-7" />
          </span>
          <h1 className="font-display mt-4 text-2xl font-bold">Payment received</h1>
          <p className="muted mt-3 text-sm leading-relaxed">
            Your <b>{plan.name}</b> plan is <b>under process</b>. We are checking the payment
            against our records and will activate your account shortly — usually within a few
            hours. You will get an email the moment it is live.
          </p>
          <p className="muted mt-3 text-sm leading-relaxed">
            You can keep using your account normally in the meantime.
          </p>
          <Link href="/dashboard" className="btn-primary mt-6 inline-flex">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-px py-14">
      <div className="mx-auto max-w-4xl">
        <Link href="/pricing" className="muted text-sm hover:text-emerald">
          ← Back to pricing
        </Link>

        <h1 className="font-display mt-4 text-3xl font-bold">Complete your payment</h1>
        <p className="muted mt-2 text-sm">
          Scan the code with any UPI app, then enter your transaction number below.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Left: what they are paying for + QR */}
          <div className="card p-6">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="muted text-xs">You are buying</p>
                <p className="font-display text-lg font-semibold">{plan.name}</p>
              </div>
              <p className="font-display text-3xl font-bold">
                ₹{plan.price.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-white p-4">
              {/* Your QR image lives at /public/upi-qr.png */}
              <img
                src={site.upiQrImage}
                alt={`UPI QR code to pay ${site.upiName}`}
                className="mx-auto h-56 w-56 object-contain"
              />
            </div>

            <div className="mt-4 text-center">
              <p className="muted text-xs">Or pay to this UPI ID</p>
              <button
                onClick={copyUpi}
                className="mt-1 font-mono text-sm font-semibold text-emerald hover:underline"
              >
                {site.upiId} {copied ? "· copied" : "· tap to copy"}
              </button>
              <p className="muted mt-1 text-xs">{site.upiName}</p>
            </div>
          </div>

          {/* Right: confirm */}
          <div className="card p-6">
            <h2 className="font-display text-base font-semibold">After you have paid</h2>
            <p className="muted mt-2 text-sm leading-relaxed">
              Your payment app shows a transaction number — sometimes called UTR, UPI reference,
              or order ID. Enter it here so we can match your payment.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/[0.07] px-3 py-2 text-sm text-amber-300">
                {error}
              </div>
            )}

            <label className="mt-5 block text-sm font-medium">
              Transaction / UTR number
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. 412345678901"
                className="field mt-1.5"
                disabled={busy}
              />
            </label>

            <label className="mt-4 block text-sm font-medium">
              Anything we should know? (optional)
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Paid from a different number, etc."
                className="field mt-1.5"
                disabled={busy}
              />
            </label>

            <button
              onClick={submit}
              disabled={busy}
              className="btn-primary mt-6 w-full disabled:opacity-50"
            >
              {busy ? "Submitting…" : "I have paid — submit for activation"}
            </button>

            <p className="muted mt-4 text-xs leading-relaxed">
              We check every payment by hand before activating, so please enter the number
              carefully. Activation is usually within a few hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container-px py-20 text-center muted">Loading…</div>}>
      <Checkout />
    </Suspense>
  );
}
