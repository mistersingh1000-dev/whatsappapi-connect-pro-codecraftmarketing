import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";

export const runtime = "nodejs";

// Razorpay checkout is intentionally disabled until the client checkout flow
// stores order IDs server-side and verifies Razorpay's signed payment payload.
// The live customer checkout currently uses manual UPI verification via /api/orders.
async function disabledResponse() {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  return NextResponse.json(
    {
      error: "razorpay_checkout_not_enabled",
      message:
        "Razorpay checkout is not enabled in the current production flow. Use the UPI checkout shown on the pricing page.",
    },
    { status: 501 }
  );
}

export async function POST() {
  return disabledResponse();
}

export async function PUT() {
  return disabledResponse();
}
