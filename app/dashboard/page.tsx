import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import DashboardDemo from "@/components/DashboardDemo";
import TrialBanner from "@/components/TrialBanner";
import PendingOrderBanner from "@/components/PendingOrderBanner";
import ConnectNumber from "@/components/ConnectNumber";

export const metadata: Metadata = {
  title: "Dashboard — WhatsApp Connection, Inbox & Analytics",
  description:
    "Connect your WhatsApp Business Platform account, view real account analytics, manage contacts and open the conversation inbox.",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={<>Your WhatsApp workspace, <span className="gradient-text">one panel</span></>}
        subtitle="Connect the Meta account first, then use the real inbox, contacts and analytics for that customer account."
      />
      <section className="container-px py-12">
        <PendingOrderBanner />
        <TrialBanner />
        <ConnectNumber />
        <DashboardDemo />
      </section>
    </>
  );
}
