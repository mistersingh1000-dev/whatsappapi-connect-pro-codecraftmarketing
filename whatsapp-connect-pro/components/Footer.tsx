import Link from "next/link";
import { footerLinks, site } from "@/lib/site";
import { Icon } from "./Icons";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t" style={{ borderColor: "var(--line)" }}>
      <div className="container-px py-14">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#2ee06f] to-[#075E54] shadow-glow">
                <Icon.whatsapp className="h-5 w-5 text-white" />
              </span>
              <span className="font-display text-[15px] font-bold">
                WhatsApp <span className="gradient-text">Connect Pro</span>
              </span>
            </Link>
            <p className="muted mt-4 max-w-sm text-sm leading-relaxed">
              The official WhatsApp Business API, set up in minutes through Meta Embedded Signup.
              Send notifications, OTPs, support and marketing — the compliant way.
            </p>
            <div className="mt-5 flex items-center gap-3 text-sm">
              <a href={`mailto:${site.email}`} className="muted hover:text-emerald">
                {site.email}
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] muted">{heading}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm muted transition-colors hover:text-emerald">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm muted sm:flex-row" style={{ borderColor: "var(--line)" }}>
          <p>© 2026 WhatsApp Connect Pro. All Rights Reserved.</p>
          <p className="text-xs">
            Not affiliated with Meta. WhatsApp is a trademark of Meta Platforms, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
