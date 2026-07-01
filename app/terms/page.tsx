import type { Metadata } from "next";
import Legal from "@/components/Legal";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using WhatsApp Connect Pro's WhatsApp Business API services.",
};

const sections = [
  { h: "1. Acceptance of terms", p: "By purchasing a plan or using WhatsApp Connect Pro, you agree to these terms and to Meta's WhatsApp Business Platform policies. If you do not agree, do not use the service." },
  { h: "2. Service description", p: "We provide access to the official WhatsApp Business (Cloud) API along with a dashboard, onboarding via Meta Embedded Signup, and supporting tools. We are an independent provider and are not affiliated with or endorsed by Meta Platforms, Inc." },
  { h: "3. Account credentials", p: "After payment you receive login credentials. You are responsible for keeping them confidential and for all activity under your account. Notify us immediately of any unauthorized use." },
  { h: "4. Acceptable use", p: "You must collect valid opt-in consent, send only approved message templates, and comply with Meta's Commerce and Business Messaging policies. Spam, unsolicited messaging, and prohibited content may result in suspension by us or by Meta." },
  { h: "5. Payments & refunds", p: "Plans are billed through Razorpay in Indian Rupees. Prices exclude applicable taxes. Conversation charges levied by Meta are separate. Refund eligibility, if any, is described at checkout." },
  { h: "6. Service availability", p: "We target high availability but do not guarantee uninterrupted service. The WhatsApp API is operated by Meta and subject to its uptime, rate limits, and quality ratings." },
  { h: "7. Limitation of liability", p: "To the maximum extent permitted by law, our liability is limited to the amount you paid in the preceding three months. We are not liable for indirect or consequential damages, including message delivery failures caused by Meta." },
  { h: "8. Changes", p: "We may update these terms; material changes will be posted on this page with a revised date. Continued use constitutes acceptance." },
];

export default function TermsPage() {
  return <Legal title="Terms & Conditions" updated="January 2026" sections={sections} />;
}
