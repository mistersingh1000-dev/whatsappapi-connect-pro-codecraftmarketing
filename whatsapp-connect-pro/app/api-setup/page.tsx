import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CodeBlock from "@/components/CodeBlock";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { Icon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "WhatsApp API Setup — Send Messages & Webhooks",
  description:
    "Step-by-step WhatsApp Business API setup: get credentials, send your first template message, and receive delivery webhooks with copy-paste code.",
};

const sendCode = `// Send a template message via the WhatsApp Cloud API
const res = await fetch(
  \`https://graph.facebook.com/v21.0/\${PHONE_NUMBER_ID}/messages\`,
  {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${ACCESS_TOKEN}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: "919876543210",
      type: "template",
      template: {
        name: "order_update",
        language: { code: "en" },
        components: [
          { type: "body", parameters: [{ type: "text", text: "#10421" }] },
        ],
      },
    }),
  }
);
const data = await res.json();`;

const webhookCode = `// app/api/webhook/route.ts  (Next.js Route Handler)
import { NextRequest, NextResponse } from "next/server";

// 1) Verification handshake from Meta
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("hub.verify_token") === process.env.VERIFY_TOKEN) {
    return new NextResponse(p.get("hub.challenge"));
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// 2) Incoming events: messages, delivery + read receipts
export async function POST(req: NextRequest) {
  const body = await req.json();
  const change = body.entry?.[0]?.changes?.[0]?.value;
  // change.statuses -> delivered / read   change.messages -> inbound
  return NextResponse.json({ received: true });
}`;

const creds = [
  { k: "WABA ID", v: "WhatsApp Business Account identifier" },
  { k: "Phone Number ID", v: "The sending number provisioned by Meta" },
  { k: "Access Token", v: "System-user token used to authorize requests" },
  { k: "App Secret", v: "Used to validate webhook signatures" },
];

export default function ApiSetupPage() {
  return (
    <>
      <PageHeader
        eyebrow="API Setup"
        title={<>Go live on the API in <span className="gradient-text">four steps</span></>}
        subtitle="Everything is provisioned after Embedded Signup. Grab your credentials and ship your first message."
      />

      <section id="docs" className="container-px py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div>
              <SectionHeading center={false} eyebrow="Step 1" title="Your credentials" />
              <p className="muted mt-4 text-sm leading-relaxed">
                After activation, these appear in your dashboard under API Credentials. Keep the
                token and app secret server-side only.
              </p>
              <div className="mt-6 space-y-3">
                {creds.map((c) => (
                  <div key={c.k} className="card flex items-center gap-4 p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald/10 text-emerald">
                      <Icon.key className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-mono text-sm font-semibold">{c.k}</p>
                      <p className="muted text-xs">{c.v}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <SectionHeading center={false} eyebrow="Step 2" title="Send a message" />
              <p className="muted mb-4 mt-4 text-sm leading-relaxed">
                A single POST to the Cloud API delivers a pre-approved template to any opted-in
                customer.
              </p>
              <CodeBlock title="send-message.ts" code={sendCode} />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="webhooks" className="container-px py-12">
        <SectionHeading
          eyebrow="Step 3 — Webhooks"
          title="Receive replies & receipts in real time"
          subtitle="Point Meta at one endpoint to capture inbound messages plus delivered and read events."
        />
        <div className="mx-auto mt-10 max-w-3xl">
          <CodeBlock title="app/api/webhook/route.ts" code={webhookCode} />
        </div>
      </section>

      <section className="container-px py-12">
        <div className="card mx-auto max-w-3xl p-8 text-center">
          <h3 className="font-display text-xl font-semibold">Step 4 — Scale safely</h3>
          <p className="muted mx-auto mt-3 max-w-xl text-sm leading-relaxed">
            Stay compliant with opt-in collection, approved templates and quality-rating monitoring
            built into your dashboard — the practices that keep your number from getting flagged.
          </p>
        </div>
      </section>
    </>
  );
}
