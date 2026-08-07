import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import FeaturesGrid from "@/components/FeaturesGrid";
import SignupFlow from "@/components/SignupFlow";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Features — Bulk Messaging, OTP, Campaigns & More",
  description:
    "Explore WhatsApp Connect Pro features: official API, Embedded Signup, bulk messaging, OTP, marketing campaigns, multi-agent inbox, chatbots, webhooks, CRM and analytics.",
};

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Features"
        title={<>Everything on top of the <span className="gradient-text">official API</span></>}
        subtitle="Twelve capabilities that turn raw API access into a complete messaging platform."
      />
      <section className="container-px py-16">
        <FeaturesGrid />
      </section>
      <section className="container-px py-12">
        <SectionHeading eyebrow="Onboarding" title="From signup to first message" />
        <div className="mt-12">
          <SignupFlow />
        </div>
      </section>
    </>
  );
}
