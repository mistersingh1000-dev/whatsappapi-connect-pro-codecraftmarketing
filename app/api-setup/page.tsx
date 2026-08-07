import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import CodeBlock from "@/components/CodeBlock";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "WhatsApp API Setup Guide — Get Approved Step by Step",
  description:
    "A complete guide to getting your WhatsApp Business API approved: what you need before you start, the one-click signup, the manual route, and how to fix the most common rejections.",
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
        name: "hello_world",
        language: { code: "en_US" },
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

const verifyDocs = [
  {
    k: "GST registration certificate",
    v: "The quickest option in India if you already have one. Meta recognises it easily.",
  },
  {
    k: "Udyam / MSME certificate",
    v: "No GST? Use this instead. It is free, takes about fifteen minutes online, and Meta accepts it for Indian businesses.",
  },
  {
    k: "Certificate of Incorporation",
    v: "For a Private Limited company or LLP.",
  },
  {
    k: "Shops and Establishment certificate",
    v: "Another accepted option for smaller businesses.",
  },
];

const verifySteps = [
  {
    n: 1,
    title: "Open your Business Portfolio",
    body: "Go to business.facebook.com. If you do not have a portfolio yet, create one. Use your legal business name — the same one that appears on the document you plan to upload.",
  },
  {
    n: 2,
    title: "Go to Security Centre",
    body: "Inside Settings, scroll down to Security Centre and press Start Verification.",
  },
  {
    n: 3,
    title: "Enter your business details",
    body: "Legal business name, full street address, city, PIN code, phone number with +91, and your website address. Everything here must match your document exactly.",
  },
  {
    n: 4,
    title: "Upload your document",
    body: "A clear PDF or photo. Blurred or cropped images get rejected, so check it is fully readable before uploading.",
  },
  {
    n: 5,
    title: "Verify your phone number",
    body: "Meta sends a code by SMS or voice call to the business number you entered.",
  },
  {
    n: 6,
    title: "Wait for the result",
    body: "Meta usually replies in about two business days, though it can take longer. You can watch the status in Security Centre at any time.",
  },
];

const prerequisites = [
  {
    k: "A Facebook account",
    v: "A normal personal account. It becomes the admin of your business assets.",
  },
  {
    k: "A Meta Business Portfolio",
    v: "Formerly called Business Manager. Create one free at business.facebook.com.",
  },
  {
    k: "A phone number nobody is using on WhatsApp",
    v: "This is the step that trips up most people. See the warning below.",
  },
  {
    k: "Your business details",
    v: "Legal name, address, website and a business email. These must match your documents.",
  },
];

const manualSteps = [
  {
    n: 1,
    title: "Create a Meta Business Portfolio",
    body: "Go to business.facebook.com and create a portfolio using your legal business name. Use a business email address, not a personal one — Meta cross-checks this during verification.",
  },
  {
    n: 2,
    title: "Create a developer app",
    body: "At developers.facebook.com, choose Create App, pick the Business type, and link it to the portfolio you just made. Then add the WhatsApp product to the app.",
  },
  {
    n: 3,
    title: "Add and verify your number",
    body: "Open WhatsApp → API Setup inside the app. Add your business phone number and enter the code Meta sends you by SMS or voice call. Meta gives you a free test number too, which is useful before your real number is ready.",
  },
  {
    n: 4,
    title: "Copy your Phone Number ID and WABA ID",
    body: "Both are shown on the API Setup screen. The Phone Number ID identifies the sending number; the WABA ID identifies the account that owns it.",
  },
  {
    n: 5,
    title: "Create a permanent access token",
    body: "The token shown on the API Setup screen expires in 24 hours. For a token that does not expire, go to Business Settings → Users → System Users, add a system user, assign it to your app with full control, then generate a token with the whatsapp_business_messaging and whatsapp_business_management permissions.",
  },
  {
    n: 6,
    title: "Paste the three values into your dashboard",
    body: "Open your dashboard here, enter the Phone Number ID, WABA ID and access token, and press Connect. You can send your first message straight away.",
  },
];

const gotchas = [
  {
    q: "The number is already registered on WhatsApp",
    a: "A number can only live in one place at a time. If it is in use on the WhatsApp or WhatsApp Business app, open that app and fully delete the account first — uninstalling is not enough. Then wait a few minutes before adding it to the API. Landlines work as long as they can receive the voice-call verification.",
  },
  {
    q: "The token stopped working after a day",
    a: "You are using the temporary token from the API Setup screen, which lasts 24 hours. Create a system user token instead, as described in step 5. That one does not expire.",
  },
  {
    q: "I do not have a GST number",
    a: "GST is not required. Indian businesses can verify with an Udyam (MSME) certificate instead, which is free and takes about fifteen minutes to get online at udyamregistration.gov.in. A Certificate of Incorporation or a Shops and Establishment certificate also works.",
  },
  {
    q: "Business verification was rejected",
    a: "Almost always a mismatch. The business name, address and phone number you typed must match your uploaded document character for character, and your website must be live with the same business name and working contact details on it. Fix the mismatch and resubmit.",
  },
  {
    q: "The display name was rejected",
    a: "Your display name has to relate clearly to your business — usually your brand name as it appears on your website. Generic words, another company's brand, or a name with no connection to your documents will be turned down.",
  },
  {
    q: "Messages send in testing but not to real customers",
    a: "Outside a 24-hour customer service window you can only send pre-approved templates, and only to people who have opted in. Create a template in WhatsApp Manager, wait for approval, then send that template.",
  },
];

export default function ApiSetupPage() {
  return (
    <>
      <PageHeader
        eyebrow="Setup Guide"
        title={
          <>
            Get your WhatsApp API <span className="gradient-text">approved</span>
          </>
        }
        subtitle="What you need before you start, the two ways to connect, and how to fix the problems that stop most applications."
      />

      {/* Before you start */}
      <section className="container-px py-16">
        <SectionHeading
          eyebrow="Before you start"
          title="Four things to have ready"
          subtitle="Gather these first. Missing one of them is the usual reason an application stalls."
        />

        <div className="mx-auto mt-10 grid max-w-3xl gap-4">
          {prerequisites.map((item, i) => (
            <Reveal key={item.k} delay={i * 60}>
              <div className="card p-5">
                <h3 className="font-display text-base font-semibold">{item.k}</h3>
                <p className="muted mt-1.5 text-sm leading-relaxed">{item.v}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={260}>
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-amber-500/40 bg-amber-500/[0.07] p-5">
            <p className="text-sm font-semibold text-amber-300">
              Read this before you pick a number
            </p>
            <p className="muted mt-2 text-sm leading-relaxed">
              The number you connect cannot be signed in to the WhatsApp app or the WhatsApp
              Business app anywhere. If it is, delete the account inside that app first —
              uninstalling the app does not release the number. Many people use a fresh SIM for
              the API and keep their existing number for personal chats.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Path A */}
      <section className="border-t container-px py-16" style={{ borderColor: "var(--line)" }}>
        <SectionHeading
          eyebrow="Option 1"
          title="One-click signup"
          subtitle="The fastest route. You log in with Facebook and we provision everything for you."
        />

        <div className="mx-auto mt-10 max-w-3xl">
          <Reveal>
            <div className="card p-6">
              <ol className="space-y-4">
                {[
                  "Press Continue with Facebook in your dashboard.",
                  "Log in and pick the business portfolio you want to use.",
                  "Choose the phone number you want to connect and enter the verification code.",
                  "Approve the permissions. Your account is provisioned automatically.",
                ].map((line, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald/20 text-xs font-bold text-emerald">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{line}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--line)" }}>
                <p className="muted text-sm leading-relaxed">
                  There is nothing to copy and paste — no tokens, no IDs. Most numbers are live
                  within minutes.
                </p>
                <Link href="/embedded-signup" className="btn-primary mt-4 inline-flex">
                  Start one-click signup
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Path B */}
      <section className="border-t container-px py-16" style={{ borderColor: "var(--line)" }}>
        <SectionHeading
          eyebrow="Option 2"
          title="Connect it yourself"
          subtitle="More steps, but you keep your credentials in your own hands and can start today."
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
        </div>

        <Reveal delay={340}>
          <div className="mx-auto mt-8 max-w-3xl text-center">
            <Link href="/dashboard" className="btn-primary inline-flex">
              Open the dashboard to connect
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Business verification */}
      <section className="border-t container-px py-16" style={{ borderColor: "var(--line)" }}>
        <SectionHeading
          eyebrow="Business verification"
          title="Getting verified by Meta"
          subtitle="Meta checks that your business is real before it unlocks the full API. This is the stage that takes the longest, so start it early."
        />

        <Reveal>
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-emerald/40 bg-emerald/[0.06] p-5">
            <p className="text-sm font-semibold text-emerald">
              No GST number? You can still get verified.
            </p>
            <p className="muted mt-2 text-sm leading-relaxed">
              A lot of small businesses assume GST is compulsory here. It is not. Meta also accepts
              an <b>Udyam (MSME) certificate</b> from Indian businesses, and Udyam registration is
              free, fully online, and usually done in about fifteen minutes at{" "}
              <span className="font-mono text-xs">udyamregistration.gov.in</span>. There are no
              documents to upload — you self-declare, using your Aadhaar and PAN. Sole proprietors
              can register without forming a company.
            </p>
          </div>
        </Reveal>

        <h3 className="font-display mx-auto mt-12 max-w-3xl text-lg font-semibold">
          Documents Meta accepts in India
        </h3>
        <div className="mx-auto mt-4 grid max-w-3xl gap-4">
          {verifyDocs.map((item, i) => (
            <Reveal key={item.k} delay={i * 50}>
              <div className="card p-5">
                <h4 className="font-display text-base font-semibold">{item.k}</h4>
                <p className="muted mt-1.5 text-sm leading-relaxed">{item.v}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <h3 className="font-display mx-auto mt-12 max-w-3xl text-lg font-semibold">
          How to submit
        </h3>
        <div className="mx-auto mt-4 max-w-3xl space-y-4">
          {verifySteps.map((step, i) => (
            <Reveal key={step.n} delay={i * 50}>
              <div className="card p-5">
                <div className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald/15 font-display text-sm font-bold text-emerald">
                    {step.n}
                  </span>
                  <div>
                    <h4 className="font-display text-base font-semibold">{step.title}</h4>
                    <p className="muted mt-1.5 text-sm leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={320}>
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-amber-500/40 bg-amber-500/[0.07] p-5">
            <p className="text-sm font-semibold text-amber-300">
              The one mistake that causes most rejections
            </p>
            <p className="muted mt-2 text-sm leading-relaxed">
              Meta compares the name and address on your document against what you typed, character
              for character. A trading name instead of the legal name, a shortened address, or a
              missing suffix is enough to fail. Open your certificate and copy the details across
              exactly as they appear — including capitals and punctuation.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Troubleshooting */}
      <section className="border-t container-px py-16" style={{ borderColor: "var(--line)" }}>
        <SectionHeading
          eyebrow="Troubleshooting"
          title="Why applications get rejected"
          subtitle="Five problems account for nearly every failed setup. Each one has a fix."
        />

        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {gotchas.map((item, i) => (
            <Reveal key={item.q} delay={i * 50}>
              <div className="card p-5">
                <h3 className="font-display text-base font-semibold">{item.q}</h3>
                <p className="muted mt-2 text-sm leading-relaxed">{item.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Code */}
      <section id="docs" className="border-t container-px py-16" style={{ borderColor: "var(--line)" }}>
        <SectionHeading
          eyebrow="For developers"
          title="Send your first message"
          subtitle="Once your number is connected, this is all it takes."
        />

        <div className="mx-auto mt-10 max-w-3xl">
          <Reveal>
            <CodeBlock title="send-message.js" code={sendCode} />
          </Reveal>
          <Reveal delay={80}>
            <p className="muted mt-4 text-sm leading-relaxed">
              The <code className="font-mono text-xs">hello_world</code> template exists on every
              new account, so you can test with it before creating your own. Build further
              templates in WhatsApp Manager and wait for approval before sending them.
            </p>
          </Reveal>
        </div>

        <div id="webhooks" className="mx-auto mt-14 max-w-3xl">
          <h3 className="font-display text-xl font-semibold">Receive incoming messages</h3>
          <p className="muted mt-2 text-sm leading-relaxed">
            Point your webhook at a public HTTPS URL. Meta first sends a verification request,
            then posts every inbound message and delivery receipt to the same address.
          </p>
          <Reveal>
            <div className="mt-5">
              <CodeBlock title="app/api/webhook/route.ts" code={webhookCode} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Help */}
      <section className="border-t container-px py-16" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold">Stuck somewhere?</h2>
          <p className="muted mt-3 text-sm leading-relaxed">
            Tell us which step you are on and what Meta said. We have seen most of the errors
            before and can usually tell you the fix straight away.
          </p>
          <Link href="/contact" className="btn-primary mt-6 inline-flex">
            Talk to support
          </Link>
        </div>
      </section>
    </>
  );
}