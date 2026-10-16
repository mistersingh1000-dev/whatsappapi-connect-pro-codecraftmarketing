import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import IndependentSoftwareNotice from "@/components/IndependentSoftwareNotice";
import { site } from "@/lib/site";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const independentDescription =
  `${site.description} Independent third-party software operated by Codecraft Marketing; not affiliated with or endorsed by Meta or WhatsApp.`;

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: "WhatsApp Connect Pro | Independent Software by Codecraft Marketing",
    template: "%s | WhatsApp Connect Pro",
  },
  description: independentDescription,
  keywords: [
    "WhatsApp Business Platform",
    "WhatsApp Cloud API",
    "Meta Embedded Signup",
    "WhatsApp API Dashboard",
    "WhatsApp Webhooks",
    "WhatsApp Conversation Inbox",
    "WhatsApp Business Integration",
  ],
  authors: [{ name: "Codecraft Marketing" }],
  openGraph: {
    title: "WhatsApp Connect Pro | Independent Software by Codecraft Marketing",
    description: independentDescription,
    url: site.domain,
    siteName: site.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Connect Pro | Independent Software by Codecraft Marketing",
    description: independentDescription,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0F0D",
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t? t==='dark' : true;document.documentElement.classList.toggle('dark',d);}catch(e){document.documentElement.classList.add('dark');}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Codecraft Marketing",
  url: site.domain,
  description: independentDescription,
  sameAs: [],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="font-sans antialiased">
        <IndependentSoftwareNotice />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
