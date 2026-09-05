import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PricingCards from "@/components/PricingCards";
import FaqAccordion from "@/components/FaqAccordion";
import SectionHeading from "@/components/SectionHeading";
import { Icon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Pricing — WhatsApp Cloud API Platform Plans",
  description:
    "Platform subscription plans for WhatsApp Connect Pro. Meta usage charges, if applicable, are separate from the platform subscription.",
};

const compare = [
  "WhatsApp Cloud API connection",
  "Meta Embedded Signup when enabled for your Meta app",
  "Dashboard & login credentials",
  "Signed webhook processing",
  "Conversation inbox & contacts",
  "Account analytics",
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title={<>Choose your <span className="gradient-text">platform plan</span></>}
        subtitle="Subscribe to the dashboard and onboarding platform. Meta WhatsApp usage charges are separate and depend on the customer's own WhatsApp Business Account usage."
      />
      <section className="container-px pt-12">
        <div className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-emerald/40 bg-gradient-to-r from-emerald/[0.10] to-transparent p-6 sm:flex-row sm:p-8">
          <div>
            <h2 className="font-display text-xl font-semibold sm:text-2xl">Try the dashboard for 7 days</h2>
            <p className="muted mt-2 max-w-xl text-sm leading-relaxed">
              Create an account, explore the dashboard and connect your WhatsApp Business Platform
              credentials. Real-message availability still depends on a valid Meta account, number,
              permissions and messaging rules.
            </p>
          </div>
          <a href="/signup" className="btn-primary shrink-0">Start free trial</a>
        </div>
      </section>

      <section className="container-px py-12">
        <PricingCards />
        <p className="muted mx-auto mt-8 max-w-2xl text-center text-xs">
          Prices are for the WhatsApp Connect Pro platform subscription. Meta may bill WhatsApp
          Business Platform usage separately under its own pricing. Current checkout uses UPI with
          manual payment verification unless Razorpay checkout is enabled in production.
        </p>
      </section>

      <section className="container-px py-12">
        <SectionHeading eyebrow="Included in the current platform" title="Core launch features" />
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
