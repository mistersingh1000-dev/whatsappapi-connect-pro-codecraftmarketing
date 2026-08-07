import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb, findUser, updateUser } from "@/lib/db";
import { listOrders, getOrder, decideOrder } from "@/lib/orders";
import { sendEmail, activationEmail } from "@/lib/email";

export const runtime = "nodejs";

function adminEmail() {
  return (process.env.ADMIN_EMAIL || "mistersingh1000@gmail.com").toLowerCase();
}

export async function GET() {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session || session.sub.toLowerCase() !== adminEmail()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 501 });

  try {
    return NextResponse.json({ orders: await listOrders(db) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

// Approve => activate the plan and extend the expiry. Reject => leave untouched.
export async function PATCH(req: Request) {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session || session.sub.toLowerCase() !== adminEmail()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 501 });

  const { id, action } = await req.json().catch(() => ({}));
  if (!id || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const order = await getOrder(db, id);
    if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "already_decided", message: "This order was already handled." },
        { status: 409 }
      );
    }

    if (action === "reject") {
      const updated = await decideOrder(db, id, "rejected", session.sub);
      return NextResponse.json({ ok: true, order: updated });
    }

    // Extend from whichever is later: today, or their current expiry.
    const user = await findUser(db, order.userId);
    const base =
      user && new Date(user.trial_ends_at) > new Date()
        ? new Date(user.trial_ends_at)
        : new Date();
    base.setMonth(base.getMonth() + order.months);
    const validUntil = base.toISOString();

    await updateUser(db, order.userId, { plan: "paid", trial_ends_at: validUntil });
    const updated = await decideOrder(db, id, "approved", session.sub);

    const mail = activationEmail({
      name: order.userName,
      planName: order.planName,
      validUntil,
    });
    await sendEmail({ to: order.userId, ...mail }).catch(() => null);

    return NextResponse.json({ ok: true, order: updated, validUntil });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
