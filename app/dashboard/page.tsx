import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import DashboardDemo from "@/components/DashboardDemo";
import TrialBanner from "@/components/TrialBanner";
import ConnectNumber from "@/components/ConnectNumber";

export const metadata: Metadata = {
  title: "Dashboard — Campaigns, Analytics & API Credentials",
  description:
    "Your WhatsApp Connect Pro dashboard: connect your number, view stats, campaigns, API credentials, delivery reports, templates and contacts.",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={<>Your whole operation, <span className="gradient-text">one panel</span></>}
        subtitle="Apply for the WhatsApp API, connect your number, and manage everything in one place."
      />
      <section className="container-px py-12">
        <TrialBanner />
        <ConnectNumber />
        <DashboardDemo />
      </section>
    </>
  );
}
