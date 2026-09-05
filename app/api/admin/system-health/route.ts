import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

function configured(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

export async function GET() {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  const adminEmail = (process.env.ADMIN_EMAIL || "mistersingh1000@gmail.com").toLowerCase();

  if (!session || session.sub.toLowerCase() !== adminEmail) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const firebaseConfigured = Boolean(
    configured("FIREBASE_SERVICE_ACCOUNT") || configured("FIREBASE_SERVICE_ACCOUNT_BASE64")
  );

  const checks = [
    {
      id: "auth",
      label: "Authentication secret",
      configured: configured("AUTH_SECRET"),
      required: true,
      help: "Required to sign customer login sessions safely in production.",
    },
    {
      id: "firebase",
      label: "Firebase service account",
      configured: firebaseConfigured && Boolean(getDb()),
      required: true,
      help: "Required for users, conversations, contacts, orders and account settings.",
    },
    {
      id: "credential-encryption",
      label: "Credential encryption key",
      configured: configured("CREDENTIAL_ENCRYPTION_KEY"),
      required: true,
      help: "Encrypts customer WhatsApp access tokens and registration metadata at rest.",
    },
    {
      id: "site-url",
      label: "Production site URL",
      configured: configured("NEXT_PUBLIC_SITE_URL"),
      required: true,
      help: "Used for canonical links and provider callbacks.",
    },
    {
      id: "meta-app-id",
      label: "Meta App ID",
      configured: configured("NEXT_PUBLIC_META_APP_ID"),
      required: true,
      help: "Required by Facebook Login for Business / Embedded Signup.",
    },
    {
      id: "meta-config-id",
      label: "Embedded Signup configuration ID",
      configured: configured("NEXT_PUBLIC_META_CONFIG_ID"),
      required: true,
      help: "Required to launch your Meta Embedded Signup configuration.",
    },
    {
      id: "meta-app-secret",
      label: "Meta App Secret",
      configured: configured("META_APP_SECRET"),
      required: true,
      help: "Used server-side for authorization and webhook signature verification.",
    },
    {
      id: "webhook-token",
      label: "WhatsApp webhook verify token",
      configured: configured("WHATSAPP_WEBHOOK_TOKEN"),
      required: true,
      help: "Required when Meta verifies the webhook subscription endpoint.",
    },
    {
      id: "provider-business-id",
      label: "Provider Meta Business ID",
      configured: configured("META_BUSINESS_ID"),
      required: false,
      help: "Needed for provider-level WABA/system-user or billing operations when your approved Meta setup uses them.",
    },
    {
      id: "provider-system-user",
      label: "Provider System User ID",
      configured: configured("META_SYSTEM_USER_ID"),
      required: false,
      help: "Needed when your approved provider flow assigns your system user to customer WABAs.",
    },
    {
      id: "provider-system-token",
      label: "Provider System User token",
      configured: configured("META_SYSTEM_USER_ACCESS_TOKEN"),
      required: false,
      help: "Server-only provider token for approved provider-level Meta operations. Never expose this in the browser.",
    },
    {
      id: "provider-credit-line",
      label: "Meta credit line ID",
      configured: configured("META_CREDIT_LINE_ID"),
      required: false,
      help: "Needed only if your approved commercial model bills client WABAs through your provider credit line.",
    },
  ];

  const requiredChecks = checks.filter((c) => c.required);
  const requiredReady = requiredChecks.every((c) => c.configured);

  return NextResponse.json({
    requiredReady,
    checks,
    metaApiVersion: process.env.WHATSAPP_API_VERSION || "v26.0",
    externalMetaChecks: [
      "Meta App Review completed for the permissions used by your provider flow",
      "Advanced Access approved for required business/WhatsApp management permissions",
      "Customer WABA and phone-number eligibility/verification completed",
      "Provider billing or credit-line model approved/configured if applicable",
    ],
  });
}
