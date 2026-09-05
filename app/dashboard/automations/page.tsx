import type { Metadata } from "next";
import AutomationManager from "@/components/AutomationManager";

export const metadata: Metadata = {
  title: "Automations — WhatsApp Connect Pro",
  description: "Create inbound WhatsApp keyword automations and automatic replies.",
};

export default function AutomationsPage() {
  return <AutomationManager />;
}
