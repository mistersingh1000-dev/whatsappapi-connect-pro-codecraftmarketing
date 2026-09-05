export const site = {
  name: "WhatsApp Connect Pro",
  shortName: "Connect Pro",
  domain:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://whatsappapi-connect-pro-codecraftma.vercel.app",
  tagline: "WhatsApp Cloud API onboarding and conversation platform",
  description:
    "Connect customer-owned WhatsApp Business Platform accounts, manage conversations and contacts, process Meta webhooks, and support compliant messaging from one dashboard.",
  email: "mistersingh1000@gmail.com",
  phone: "+91 70097 32517",
  // wa.me format: country code + number, no "+", spaces or dashes.
  whatsapp: "917009732517",
  whatsappMessage: "Hi, I am interested in the WhatsApp Connect Pro platform.",

  // ---- UPI payment (manual approval) ----
  upiId: "9501216365@mbk",
  upiName: "Codecraft Marketing · MobiKwik",
  upiQrImage: "/upi-qr.jpeg",
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
    { label: "Dashboard", href: "/dashboard" },
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
    features: ["Cloud API dashboard", "Account connection", "Conversation inbox", "Technical support"],
    cta: "Start now",
  },
  {
    id: "quarterly",
    name: "3 Months",
    price: 999,
    per: "/quarter",
    features: ["Everything in Monthly", "Priority support", "Guided setup"],
    cta: "Choose plan",
  },
  {
    id: "halfyear",
    name: "6 Months",
    price: 1499,
    per: "/6 mo",
    features: ["Everything included", "Onboarding assistance", "API guidance"],
    cta: "Choose plan",
  },
  {
    id: "yearly",
    name: "1 Year",
    price: 1999,
    per: "/year",
    badge: "Best seller",
    features: ["Longer access", "Priority support", "API guidance"],
    cta: "Choose plan",
  },
  {
    id: "3year",
    name: "3 Years",
    price: 2999,
    per: "/3 yr",
    features: ["Long-term platform access", "Priority support", "Onboarding assistance"],
    cta: "Choose plan",
  },
  {
    id: "5year",
    name: "5 Years",
    price: 3999,
    per: "/5 yr",
    features: ["Long-term platform access", "Priority support", "Business onboarding assistance"],
    cta: "Choose plan",
  },
  {
    id: "10year",
    name: "10 Years",
    price: 4999,
    per: "/10 yr",
    features: ["Long-term platform access", "Priority support", "Business onboarding assistance"],
    cta: "Choose plan",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: 5999,
    note: "one-time platform access",
    badge: "Most popular",
    highlight: true,
    features: [
      "Lifetime platform access",
      "Priority support",
      "Product updates included",
      "Guided onboarding",
    ],
    cta: "Buy lifetime plan",
  },
];

// Kept for compatibility with components that may still import this list.
// Customer-facing feature grids use lib/launch-features.ts so only tested scope is advertised.
export const features = [
  { title: "WhatsApp Cloud API Connection", desc: "Connect and validate a customer-owned WhatsApp phone number.", icon: "shield" },
  { title: "Meta Embedded Signup", desc: "Use Facebook Login for Business when your Meta configuration and permissions are enabled.", icon: "spark" },
  { title: "Conversation Inbox", desc: "View inbound conversations and reply from the dashboard within applicable messaging rules.", icon: "inbox" },
  { title: "Contacts", desc: "Keep WhatsApp contacts organized per customer account.", icon: "link" },
  { title: "Signed Webhooks", desc: "Process authenticated Meta webhook events for messages and message status updates.", icon: "webhook" },
  { title: "Account Analytics", desc: "See conversation, contact, message, unread and connection metrics.", icon: "chart" },
];

export const signupSteps = [
  {
    n: 1,
    title: "Sign in to the platform",
    desc: "Create your WhatsApp Connect Pro account and open the API setup area.",
  },
  {
    n: 2,
    title: "Open Meta onboarding",
    desc: "Use Embedded Signup when enabled, or connect approved Cloud API credentials manually.",
  },
  {
    n: 3,
    title: "Choose business assets",
    desc: "Select the correct Meta Business Portfolio, WhatsApp Business Account and phone number.",
  },
  {
    n: 4,
    title: "Complete Meta requirements",
    desc: "Finish any number verification, business verification or permission steps Meta requires for that account.",
  },
  {
    n: 5,
    title: "Use the dashboard",
    desc: "Receive webhook events, manage conversations and send messages subject to WhatsApp messaging rules.",
  },
];

export const faqs = [
  {
    q: "What is the WhatsApp Business Platform Cloud API?",
    a: "It is Meta's official programmatic WhatsApp interface for eligible businesses. Businesses can send and receive messages through approved integrations, subject to Meta's policies, permissions, templates and messaging rules.",
  },
  {
    q: "How does Embedded Signup work?",
    a: "Embedded Signup uses Meta's Facebook Login for Business flow. A customer chooses the relevant business and WhatsApp assets in a Meta-hosted flow, and the platform completes the server-side connection after Meta returns the required authorization result.",
  },
  {
    q: "Does Embedded Signup work immediately for every customer?",
    a: "Not always. Your Meta app must be configured correctly, and production onboarding can require approved permissions, advanced access, business verification or other Meta review steps. Individual customer accounts can also have their own eligibility or verification requirements.",
  },
  {
    q: "Can I use an existing WhatsApp number?",
    a: "It depends on the number's current WhatsApp setup and Meta's supported migration or coexistence options at the time you onboard it. Check the current Meta flow shown during onboarding rather than deleting an existing account without confirming the migration path.",
  },
  {
    q: "Can I send bulk or marketing messages?",
    a: "Business-initiated messaging must follow Meta's current opt-in, template, category and policy requirements. The platform should only be used for compliant recipients and approved message flows.",
  },
  {
    q: "Are Meta messaging charges included in the platform price?",
    a: "No. The prices shown here are for WhatsApp Connect Pro platform access. Any WhatsApp Business Platform usage charges billed by Meta are separate and depend on the customer's own account activity and Meta's current pricing.",
  },
  {
    q: "Do you provide setup support?",
    a: "Yes. The platform plans include onboarding guidance for connecting the account, checking IDs and credentials, and configuring the required webhook and dashboard steps.",
  },
];

// Legacy compatibility export. Not rendered on the launch homepage.
export const stats = [
  { value: 6, suffix: "", label: "Launch-ready capabilities" },
  { value: 7, suffix: " days", label: "Dashboard trial" },
  { value: 1, suffix: "", label: "Unified conversation dashboard" },
  { value: 0, suffix: "", label: "Unsupported performance claims" },
];
