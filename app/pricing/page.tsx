import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PricingCards from "@/components/PricingCards";
import FaqAccordion from "@/components/FaqAccordion";
import SectionHeading from "@/components/SectionHeading";
import { Icon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Pricing — WhatsApp Business API Plans",
  description:
    "Transparent WhatsApp Business API pricing — monthly to lifetime plans starting at ₹499. Official API, Embedded Signup and support included.",
};

const compare = [
  "Official WhatsApp Cloud API",
  "Meta Embedded Signup",
  "Dashboard & login credentials",
  "Webhooks & API access",
  "Template message management",
  "Delivery & read reports",
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title={<>Choose your <span className="gradient-text">perfect plan</span></>}
        subtitle="Buy a plan, receive your login by email, and activate the official API through Embedded Signup. No hidden setup fees."
      />
      <section className="container-px pt-12">
        <div className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-emerald/40 bg-gradient-to-r from-emerald/[0.10] to-transparent p-6 sm:flex-row sm:p-8">
          <div>
            <h2 className="font-display text-xl font-semibold sm:text-2xl">
              Try it free for 7 days
            </h2>
            <p className="muted mt-2 max-w-xl text-sm leading-relaxed">
              Sign up free, connect your number and send real WhatsApp messages on the official API.
              No credit card — your trial auto-expires after 7 days.
            </p>
          </div>
          <a href="/signup" className="btn-primary shrink-0">Start free trial</a>
        </div>
      </section>

      <section className="container-px py-12">
        <PricingCards />
        <p className="muted mx-auto mt-8 max-w-2xl text-center text-xs">
          Prices are exclusive of applicable taxes. Meta may bill conversation charges separately
          per its official pricing. Razorpay handles all payments securely.
        </p>
      </section>

      <section className="container-px py-12">
        <SectionHeading eyebrow="Included in every plan" title="The essentials, never gated" />
        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          {compare.map((c) => (
            <div key={c} className="card flex items-center gap-3 p-4 text-sm">
              <Icon.check className="h-5 w-5 shrink-0 text-emerald" />
              {c}
            </div>
          ))}
        </div>
      </section>

      <section className="container-px py-16">
        <SectionHeading eyebrow="Billing FAQ" title="Good to know" />
        <div className="mt-12">
          <FaqAccordion />
        </div>
      </section>
    </>
  );
}
