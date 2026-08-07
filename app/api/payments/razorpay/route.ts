import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb, findUser, updateUser } from "@/lib/db";

export const runtime = "nodejs";

type PlanKey = "monthly" | "quarterly" | "halfyearly" | "yearly" | "lifetime";

const PLANS: Record<PlanKey, { label: string; amountPaise: number; addMonths: number }> = {
  monthly: { label: "Monthly", amountPaise: 49900, addMonths: 1 },
  quarterly: { label: "3 Months", amountPaise: 99900, addMonths: 3 },
  halfyearly: { label: "6 Months", amountPaise: 149900, addMonths: 6 },
  yearly: { label: "1 Year", amountPaise: 199900, addMonths: 12 },
  lifetime: { label: "Lifetime", amountPaise: 599900, addMonths: 1200 },
};

// Built lazily inside the handler. Constructing at module scope crashes the
// build when the keys aren't set yet.
async function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  const { default: Razorpay } = await import("razorpay");
  return new Razorpay({ key_id, key_secret });
}

export async function POST(req: Request) {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const { plan } = await req.json().catch(() => ({}));
  const details = PLANS[plan as PlanKey];
  if (!details) return NextResponse.json({ error: "invalid_plan" }, { status: 400 });

  const razorpay = await getRazorpay();
  if (!razorpay) {
    return NextResponse.json(
      {
        error: "payments_not_configured",
        message: "Payments aren't set up yet. Add your Razorpay keys in Vercel.",
      },
      { status: 501 }
    );
  }

  try {
    const order = await razorpay.orders.create({
      amount: details.amountPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { email: session.sub, plan },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      planLabel: details.label,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "order_failed", message: e?.message || "Could not start the payment." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 501 });

  const { paymentId, plan } = await req.json().catch(() => ({}));
  const details = PLANS[plan as PlanKey];
  if (!paymentId || !details) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const razorpay = await getRazorpay();
  if (!razorpay) {
    return NextResponse.json({ error: "payments_not_configured" }, { status: 501 });
  }

  try {
    const payment: any = await razorpay.payments.fetch(paymentId);

    if (payment?.status !== "captured") {
      return NextResponse.json(
        { error: "payment_not_captured", message: "Payment wasn't completed." },
        { status: 400 }
      );
    }
    if (payment?.notes?.email && payment.notes.email !== session.sub) {
      return NextResponse.json({ error: "payment_mismatch" }, { status: 403 });
    }
    if (Number(payment?.amount) !== details.amountPaise) {
      return NextResponse.json({ error: "amount_mismatch" }, { status: 400 });
    }

    // Extend from whichever is later: today, or the existing expiry.
    const user = await findUser(db, session.sub);
    const base = user && new Date(user.trial_ends_at) > new Date()
      ? new Date(user.trial_ends_at)
      : new Date();
    base.setMonth(base.getMonth() + details.addMonths);

    await updateUser(db, session.sub, {
      plan: "paid",
      trial_ends_at: base.toISOString(),
    });

    return NextResponse.json({ ok: true, plan: "paid", validUntil: base.toISOString() });
  } catch (e: any) {
    return NextResponse.json(
      { error: "verification_failed", message: e?.message || "Could not verify the payment." },
      { status: 500 }
    );
  }
}
