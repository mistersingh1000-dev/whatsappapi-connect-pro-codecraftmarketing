export const site = {
  name: "WhatsApp Connect Pro",
  shortName: "Connect Pro",
  domain: "https://whatsappconnectpro.example",
  tagline: "Official WhatsApp Business API Provider",
  description:
    "Get Official WhatsApp Business API with Meta Embedded Signup. Instant activation, bulk messaging, marketing campaigns, CRM integration and 24/7 support.",
  email: "sales@whatsappconnectpro.example",
  phone: "+91 90000 00000",
  whatsapp: "919000000000",
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "API Setup", href: "/api-setup" },
  { label: "Embedded Signup", href: "/embedded-signup" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "FAQ", href: "/faq" },
];

export const footerLinks = {
  Product: [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Dashboard Demo", href: "/dashboard" },
  ],
  Developers: [
    { label: "API Setup", href: "/api-setup" },
    { label: "Embedded Signup", href: "/embedded-signup" },
    { label: "API Documentation", href: "/api-setup#docs" },
    { label: "Webhooks", href: "/api-setup#webhooks" },
  ],
  Company: [
    { label: "Contact", href: "/contact" },
    { label: "Support", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  per?: string;
  note?: string;
  badge?: string;
  highlight?: boolean;
  features: string[];
  cta: string;
};

export const plans: Plan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: 499,
    per: "/month",
    features: ["Official WhatsApp API", "Embedded Signup", "Dashboard access", "Technical support"],
    cta: "Start now",
  },
  {
    id: "quarterly",
    name: "3 Months",
    price: 999,
    per: "/quarter",
    features: ["Everything in Monthly", "Priority support", "Free setup"],
    cta: "Choose plan",
  },
  {
    id: "halfyear",
    name: "6 Months",
    price: 1499,
    per: "/6 mo",
    features: ["Everything included", "Faster activation", "API assistance"],
    cta: "Choose plan",
  },
  {
    id: "yearly",
    name: "1 Year",
    price: 1999,
    per: "/year",
    badge: "Best seller",
    features: ["Best-seller savings", "Premium support", "API guidance"],
    cta: "Choose plan",
  },
  {
    id: "3year",
    name: "3 Years",
    price: 2999,
    per: "/3 yr",
    features: ["Long-term savings", "Premium dashboard", "Priority ticket support"],
    cta: "Choose plan",
  },
  {
    id: "5year",
    name: "5 Years",
    price: 3999,
    per: "/5 yr",
    features: ["VIP support", "Business consultation", "Dedicated assistance"],
    cta: "Choose plan",
  },
  {
    id: "10year",
    name: "10 Years",
    price: 4999,
    per: "/10 yr",
    features: ["Maximum savings", "Premium benefits", "Fastest support"],
    cta: "Choose plan",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: 5999,
    note: "one-time",
    badge: "Most popular",
    highlight: true,
    features: [
      "Lifetime access",
      "Premium support",
      "Future updates",
      "Priority activation",
      "VIP assistance",
    ],
    cta: "Buy lifetime plan",
  },
];

export const features = [
  { title: "Official WhatsApp Business API", desc: "Cloud API access straight from Meta — no grey routes, no ban risk.", icon: "shield" },
  { title: "Meta Embedded Signup", desc: "Onboard inside our dashboard with Facebook login in a single flow.", icon: "spark" },
  { title: "Instant Number Activation", desc: "Connect and verify your business number in minutes, not days.", icon: "bolt" },
  { title: "Bulk Messaging", desc: "Reach thousands of opted-in customers with approved templates.", icon: "send" },
  { title: "OTP Authentication", desc: "Deliver one-time passwords with high-priority authentication templates.", icon: "key" },
  { title: "Marketing Campaigns", desc: "Schedule, segment and track promotional broadcasts that convert.", icon: "rocket" },
  { title: "Multi-Agent Inbox", desc: "A shared team inbox so multiple agents handle chats without collisions.", icon: "inbox" },
  { title: "Chatbot Integration", desc: "Automate replies and flows, then hand off to a human when needed.", icon: "bot" },
  { title: "Webhook Support", desc: "Real-time delivery, read and inbound events pushed to your endpoint.", icon: "webhook" },
  { title: "CRM Integration", desc: "Sync contacts and conversations with your existing CRM stack.", icon: "link" },
  { title: "Analytics Dashboard", desc: "Live metrics on sends, delivery, reads and campaign performance.", icon: "chart" },
  { title: "Delivery Reports", desc: "Per-message status with downloadable, exportable reports.", icon: "report" },
];

export const signupSteps = [
  { n: 1, title: "Login with Facebook", desc: "Sign in with the Facebook account that owns your Business Manager." },
  { n: 2, title: "Verify business details", desc: "Confirm your business name, category and legal details with Meta." },
  { n: 3, title: "Connect WhatsApp number", desc: "Pick a new or existing number and receive your verification code." },
  { n: 4, title: "Activate WhatsApp API", desc: "Meta provisions your WABA and phone number ID automatically." },
  { n: 5, title: "Start sending messages", desc: "Grab your API credentials and send your first template message." },
];

export const faqs = [
  {
    q: "What is the WhatsApp Business API?",
    a: "It's Meta's official programmatic channel for businesses to send and receive WhatsApp messages at scale — notifications, OTPs, support and marketing. Unlike unofficial bulk tools, it's compliant and built so your number won't get banned for normal, opt-in messaging.",
  },
  {
    q: "How does Embedded Signup work?",
    a: "Embedded Signup is Meta's in-context onboarding. You log in with Facebook from inside our dashboard, confirm your business, select a phone number and approve permissions — all in one popup. We then receive a token to provision your WhatsApp Business Account instantly.",
  },
  {
    q: "How long does activation take?",
    a: "Most numbers activate within minutes once Embedded Signup completes. Business verification with Meta, if required for higher limits, can take longer and depends on Meta's review.",
  },
  {
    q: "Can I use my existing number?",
    a: "Yes. You can migrate a number that isn't already registered on a personal or Business app, or pick a fresh number. We guide you through the verification either way.",
  },
  {
    q: "Do you provide support?",
    a: "Yes — every plan includes technical support, and higher tiers add priority and VIP assistance with dedicated onboarding help.",
  },
  {
    q: "Can I integrate CRM systems?",
    a: "Absolutely. Use our webhooks and REST endpoints to sync with your CRM, helpdesk or custom backend. Popular CRMs connect through our integrations or a few lines of API code.",
  },
];

export const stats = [
  { value: 12, suffix: "M+", label: "Messages delivered" },
  { value: 3500, suffix: "+", label: "Businesses onboarded" },
  { value: 99.9, suffix: "%", label: "API uptime" },
  { value: 24, suffix: "/7", label: "Support coverage" },
];
