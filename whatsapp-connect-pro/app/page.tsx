import Link from "next/link";
import HeroChat from "@/components/HeroChat";
import FeaturesGrid from "@/components/FeaturesGrid";
import SignupFlow from "@/components/SignupFlow";
import PricingCards from "@/components/PricingCards";
import FaqAccordion from "@/components/FaqAccordion";
import ContactForm from "@/components/ContactForm";
import Stats from "@/components/Stats";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { Icon } from "@/components/Icons";

const trust = [
  "Meta Embedded Signup",
  "Official API Integration",
  "Instant Activation",
  "24/7 Support",
];

export default function HomePage() {
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-glow" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-dark [mask-image:radial-gradient(70%_50%_at_50%_0%,black,transparent)] [background-size:42px_42px]" />
        <div className="container-px grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <Reveal>
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                Official Business Solution Provider
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Official <span className="gradient-text">WhatsApp Business API</span> Provider
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="muted mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
                Send bulk messages, marketing campaigns, OTPs, notifications and customer-support
                messages through the official WhatsApp Business API — compliant, opt-in, and built
                so your number stays safe.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/signup" className="btn-primary">
                  Start 7-day free trial <Icon.arrow className="h-4 w-4" />
                </Link>
                <Link href="/pricing" className="btn-ghost">
                  View pricing
                </Link>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <ul className="mt-9 grid max-w-lg grid-cols-2 gap-3">
                {trust.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm">
                    <Icon.check className="h-4 w-4 shrink-0 text-emerald" />
                    <span className="muted">{t}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={200} className="lg:justify-self-end">
            <HeroChat />
          </Reveal>
        </div>

        {/* logo marquee */}
        <div className="border-y py-5" style={{ borderColor: "var(--line)" }}>
          <div className="container-px flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm muted">
            <span className="text-xs uppercase tracking-[0.18em]">Powered by Meta Cloud API</span>
            <span className="hidden h-4 w-px bg-current opacity-20 sm:block" />
            <span>Webhooks</span>
            <span>Template Messages</span>
            <span>Razorpay Billing</span>
            <span>CRM Sync</span>
            <span>Multi-Agent Inbox</span>
          </div>
        </div>
      </section>

      {/* ---------------- STATS ---------------- */}
      <section className="container-px py-16">
        <Stats />
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section className="container-px py-12">
        <SectionHeading
          eyebrow="Everything included"
          title={<>Built for teams that message <span className="gradient-text">at scale</span></>}
          subtitle="From OTPs to full marketing campaigns — every tool you need on top of the official API."
        />
        <div className="mt-12">
          <FeaturesGrid limit={6} />
        </div>
        <div className="mt-8 text-center">
          <Link href="/features" className="btn-ghost">
            See all 12 features <Icon.arrow className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ---------------- EMBEDDED SIGNUP ---------------- */}
      <section className="container-px py-16">
        <SectionHeading
          eyebrow="Meta Embedded Signup"
          title="Connect WhatsApp in minutes"
          subtitle="No PDFs, no waiting on email threads. Onboard with Facebook login right from your dashboard."
        />
        <div className="mt-12">
          <SignupFlow />
        </div>
        <div className="mt-8 text-center">
          <Link href="/embedded-signup" className="btn-primary">
            Try Embedded Signup <Icon.arrow className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ---------------- PRICING ---------------- */}
      <section className="container-px py-16">
        <SectionHeading
          eyebrow="Simple pricing"
          title="Choose your perfect plan"
          subtitle="One rate, no per-message markup surprises. Buy a plan, get your login, and you're live."
        />
        <div className="mt-12">
          <PricingCards />
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="container-px py-16">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-12">
          <FaqAccordion />
        </div>
      </section>

      {/* ---------------- CONTACT ---------------- */}
      <section className="container-px py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              center={false}
              eyebrow="Talk to us"
              title="Request a demo"
              subtitle="Tell us about your use case and we'll get you live on the official API fast."
            />
            <div className="mt-6 space-y-3 text-sm">
              <p className="flex items-center gap-3">
                <Icon.whatsapp className="h-5 w-5 text-emerald" /> Chat anytime via the WhatsApp button
              </p>
              <p className="flex items-center gap-3">
                <Icon.shield className="h-5 w-5 text-emerald" /> Official, compliant, ban-safe messaging
              </p>
              <p className="flex items-center gap-3">
                <Icon.bolt className="h-5 w-5 text-emerald" /> Activation in minutes, not days
              </p>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
