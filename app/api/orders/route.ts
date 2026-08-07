import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb, findUser } from "@/lib/db";
import { createOrder, pendingOrderFor } from "@/lib/orders";
import { sendEmail, customerOrderEmail, adminOrderEmail } from "@/lib/email";
import { plans, site } from "@/lib/site";

export const runtime = "nodejs";

const DURATION_MONTHS: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  halfyear: 6,
  yearly: 12,
  "3year": 36,
  "5year": 60,
  "10year": 120,
  lifetime: 1200,
};

// Tell the dashboard whether this customer already has a payment awaiting review.
export async function GET() {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 501 });

  try {
    const order = await pendingOrderFor(db, session.sub);
    return NextResponse.json({ pending: order });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json(
      { error: "not_authenticated", message: "Please log in first." },
      { status: 401 }
    );
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 501 });

  const body = await req.json().catch(() => ({}));
  const planId = String(body.planId || "");
  const reference = String(body.reference || "").trim();
  const payerNote = String(body.note || "").trim();

  const plan = plans.find((p) => p.id === planId);
  const months = DURATION_MONTHS[planId];
  if (!plan || !months) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }
  if (reference.length < 6) {
    return NextResponse.json(
      {
        error: "bad_reference",
        message: "Please enter the transaction / UTR number from your payment app.",
      },
      { status: 400 }
    );
  }

  try {
    // One pending order at a time, so a customer can't flood the queue.
    const existing = await pendingOrderFor(db, session.sub);
    if (existing) {
      return NextResponse.json(
        {
          error: "already_pending",
          message:
            "You already have a payment under review. We will activate your plan shortly.",
        },
        { status: 409 }
      );
    }

    const user = await findUser(db, session.sub);

    const order = await createOrder(db, {
      userId: session.sub,
      userName: user?.name || session.name || null,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      months,
      reference,
      payerNote: payerNote || null,
      decidedAt: null as any,
      decidedBy: null as any,
    } as any);

    // Emails are best-effort. The order is already saved, and it shows in the
    // admin panel either way, so a mail failure must not lose the sale.
    const adminEmail = process.env.ADMIN_EMAIL || site.email;
    const adminUrl = `${site.domain}/admin/orders`;

    const cust = customerOrderEmail({
      name: order.userName,
      planName: order.planName,
      amount: order.amount,
      reference: order.reference,
    });
    const adm = adminOrderEmail({
      userId: order.userId,
      name: order.userName,
      planName: order.planName,
      amount: order.amount,
      reference: order.reference,
      note: order.payerNote,
      adminUrl,
    });

    await Promise.allSettled([
      sendEmail({ to: order.userId, ...cust }),
      sendEmail({ to: adminEmail, ...adm }),
    ]);

    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "save_failed", message: e?.message || "Could not record your payment." },
      { status: 500 }
    );
  }
}
