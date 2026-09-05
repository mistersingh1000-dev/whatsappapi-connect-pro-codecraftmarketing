import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import CodeBlock from "@/components/CodeBlock";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "WhatsApp Cloud API Setup Guide — Customer & Provider Steps",
  description:
    "A practical WhatsApp Business Platform setup guide for customers and for multi-client Meta Embedded Signup providers.",
};

const sendCode = `// Example: send an approved template through the Cloud API
const res = await fetch(
  \`https://graph.facebook.com/v26.0/\${PHONE_NUMBER_ID}/messages\`,
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
        name: "YOUR_APPROVED_TEMPLATE",
        language: { code: "en_US" },
      },
    }),
  }
);`;

const customerReady = [
  {
    k: "Meta Business Portfolio",
    v: "Use the business portfolio that actually owns or should own the customer's WhatsApp assets.",
  },
  {
    k: "Business details",
    v: "Keep the legal/brand name, website, email and business information consistent. Meta can request verification depending on the account and use case.",
  },
  {
    k: "A phone number you control",
    v: "The number must be eligible for the onboarding path Meta shows. Existing numbers may need migration or another supported Meta flow, so do not delete an existing WhatsApp account unless the current Meta flow specifically requires it.",
  },
  {
    k: "Permission to receive verification codes",
    v: "The business must be able to complete any SMS, voice or in-product verification Meta requests for the phone number.",
  },
];

const embeddedSteps = [
  {
    n: 1,
    title: "Open the dashboard",
    body: "Sign in to WhatsApp Connect Pro and choose Connect with Meta.",
  },
  {
    n: 2,
    title: "Continue with Facebook",
    body: "Use the Facebook account that has access to the correct Meta Business Portfolio.",
  },
  {
    n: 3,
    title: "Choose the business and WhatsApp assets",
    body: "Select the correct Business Portfolio, WhatsApp Business Account and phone number in Meta's hosted window.",
  },
  {
    n: 4,
    title: "Complete Meta verification",
    body: "Finish any phone-number, business or permission checks shown by Meta. Requirements can differ by business and number.",
  },
  {
    n: 5,
    title: "Wait for the dashboard status",
    body: "The platform exchanges the Meta authorization result, subscribes webhook events and attempts the Cloud API phone-registration step. The dashboard will show Connected or Activation Pending.",
  },
];

const manualSteps = [
  {
    n: 1,
    title: "Open Meta's WhatsApp API setup",
    body: "Use the Meta developer app / WhatsApp Business Platform setup that already owns the customer's number.",
  },
  {
    n: 2,
    title: "Copy the Phone Number ID",
    body: "This is the numeric Cloud API phone-number identifier, not the visible WhatsApp phone number.",
  },
  {
    n: 3,
    title: "Copy the WABA ID",
    body: "This identifies the WhatsApp Business Account that owns the phone number and is recommended for webhook/account management.",
  },
  {
    n: 4,
    title: "Use an appropriate server access token",
    body: "Use a token with the permissions required for the actions you need. Tokens can be revoked or invalidated, so treat them as secrets and rotate them when necessary.",
  },
  {
    n: 5,
    title: "Connect in the dashboard",
    body: "Open the Advanced manual connection area, paste the IDs and token, and click Verify & connect. The server checks the Phone Number ID against Meta before saving the encrypted token.",
  },
];

const providerRequirements = [
  {
    k: "Meta App Review / Advanced Access",
    v: "For a released multi-client Embedded Signup flow, Meta's official provider documentation requires App Review and Advanced Access for the provider permissions used by the flow, including business_management and whatsapp_business_management.",
  },
  {
    k: "Messaging permission",
    v: "Cloud API phone registration and messaging actions require whatsapp_business_messaging on the token used for those operations.",
  },
  {
    k: "WABA system-user/provider operations",
    v: "A full Tech Provider / Solution Partner setup can require assigning provider system users to customer WABAs and verifying access to the shared business assets.",
  },
  {
    k: "Phone registration",
    v: "After Embedded Signup, the Cloud API phone number must be registered with a 6-digit two-step verification PIN. The platform now attempts this automatically and stores the PIN encrypted.",
  },
  {
    k: "Webhook subscription",
    v: "The provider app must subscribe to each connected WABA so inbound messages and delivery/read events can reach the platform webhook.",
  },
  {
    k: "Billing model",
    v: "If you use a provider credit line, Meta's provider flow includes sharing/attaching that credit line to client WABAs. If your commercial model is different, configure the Meta billing path that applies to your approved provider setup before selling at scale.",
  },
];

const gotchas = [
  {
    q: "Embedded Signup finished but dashboard says Activation Pending",
    a: "Meta returned the WABA and phone IDs, but the final Cloud API registration call did not complete. This usually points to permissions, number eligibility, verification, token access or another Meta-side requirement. Do not keep creating duplicate WABAs; check the provider configuration first.",
  },
  {
    q: "The access token stopped working",
    a: "Access tokens are credentials, not permanent ownership. They can expire, be revoked, lose permissions or become invalid after account/app changes. Generate the correct server token again and reconnect if needed.",
  },
  {
    q: "The number is already used in WhatsApp or WhatsApp Business",
    a: "Do not automatically delete the existing account. Meta supports different onboarding, migration and coexistence paths over time. Use the current option shown by Meta for that specific number and business.",
  },
  {
    q: "A normal text message works sometimes but fails for a new customer",
    a: "Free-form replies are governed by the customer-service window. When a business needs to start or reopen a conversation outside the allowed window, use an approved WhatsApp template and make sure the recipient has the required opt-in.",
  },
  {
    q: "Can I send bulk marketing to any phone list?",
    a: "No. Use the platform only for recipients and message flows that comply with Meta's current opt-in, template, quality and messaging policies. The official API does not remove those requirements.",
  },
];

export default function ApiSetupPage() {
  return (
    <>
      <PageHeader
        eyebrow="Setup Guide"
        title={<>Connect WhatsApp <span className="gradient-text">the right way</span></>}
        subtitle="A simple customer flow first, plus the provider requirements needed before you onboard many businesses through your own platform."
      />

      <section className="container-px py-16">
        <SectionHeading
          eyebrow="Customer checklist"
          title="Have these ready before onboarding"
          subtitle="This avoids most failed or duplicate setup attempts."
        />
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          {customerReady.map((item, i) => (
            <Reveal key={item.k} delay={i * 50}>
              <div className="card h-full p-5">
                <h3 className="font-display text-base font-semibold">{item.k}</h3>
                <p className="muted mt-1.5 text-sm leading-relaxed">{item.v}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t container-px py-16" style={{ borderColor: "var(--line)" }}>
        <SectionHeading
          eyebrow="Recommended"
          title="Meta Embedded Signup"
          subtitle="Best for non-technical customers once your provider Meta app is approved and configured."
        />
        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {embeddedSteps.map((step, i) => (
            <Reveal key={step.n} delay={i * 50}>
              <div className="card p-5">
                <div className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald/15 font-display text-sm font-bold text-emerald">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold">{step.title}</h3>
                    <p className="muted mt-1.5 text-sm leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
          <div className="pt-4 text-center">
            <Link href="/embedded-signup" className="btn-primary inline-flex">
              Open Embedded Signup
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t container-px py-16" style={{ borderColor: "var(--line)" }}>
        <SectionHeading
          eyebrow="Advanced fallback"
          title="Connect existing Cloud API credentials"
          subtitle="Use this when the business already has a working Meta Cloud API setup."
        />
        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {manualSteps.map((step, i) => (
            <Reveal key={step.n} delay={i * 50}>
              <div className="card p-5">
                <div className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald/15 font-display text-sm font-bold text-emerald">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold">{step.title}</h3>
                    <p className="muted mt-1.5 text-sm leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
          <div className="pt-4 text-center">
            <Link href="/dashboard" className="btn-primary inline-flex">
              Open dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t container-px py-16" style={{ borderColor: "var(--line)" }}>
        <SectionHeading
          eyebrow="Your provider setup"
          title="What CodeCraft Marketing must complete with Meta"
          subtitle="These are platform-owner requirements, not steps every customer should have to understand."
        />
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          {providerRequirements.map((item, i) => (
            <Reveal key={item.k} delay={(i % 2) * 60}>
              <div className="card h-full p-5">
                <h3 className="font-display text-base font-semibold">{item.k}</h3>
                <p className="muted mt-1.5 text-sm leading-relaxed">{item.v}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="docs" className="border-t container-px py-16" style={{ borderColor: "var(--line)" }}>
        <SectionHeading
          eyebrow="Messaging example"
          title="Send an approved template"
          subtitle="Use approved templates when WhatsApp rules require a business-initiated template message."
        />
        <div className="mx-auto mt-10 max-w-3xl">
          <CodeBlock title="send-template.js" code={sendCode} />
        </div>
      </section>

      <section className="border-t container-px py-16" style={{ borderColor: "var(--line)" }}>
        <SectionHeading eyebrow="Troubleshooting" title="Common setup problems" />
        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {gotchas.map((item, i) => (
            <Reveal key={item.q} delay={i * 40}>
              <div className="card p-5">
                <h3 className="font-display text-base font-semibold">{item.q}</h3>
                <p className="muted mt-2 text-sm leading-relaxed">{item.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
