import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const Icon = {
  shield: (p: IconProps) => (
    <svg {...base(p)}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /><path d="m9 12 2 2 4-4" /></svg>
  ),
  spark: (p: IconProps) => (
    <svg {...base(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4z" /></svg>
  ),
  bolt: (p: IconProps) => (
    <svg {...base(p)}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" /></svg>
  ),
  send: (p: IconProps) => (
    <svg {...base(p)}><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>
  ),
  key: (p: IconProps) => (
    <svg {...base(p)}><circle cx="8" cy="15" r="4" /><path d="m10.5 12.5 7-7M17 5l3 3M15 7l2 2" /></svg>
  ),
  rocket: (p: IconProps) => (
    <svg {...base(p)}><path d="M5 13c-1.5.5-3 2-3 6 4 0 5.5-1.5 6-3" /><path d="M14 4c4 1 6 3 6 3s-1 6-5 9l-5-1-3-3 1-5c3-4 6-3 6-3z" /><circle cx="14.5" cy="9.5" r="1.5" /></svg>
  ),
  inbox: (p: IconProps) => (
    <svg {...base(p)}><path d="M3 12h5l2 3h4l2-3h5" /><path d="M5 5h14l2 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l2-7z" /></svg>
  ),
  bot: (p: IconProps) => (
    <svg {...base(p)}><rect x="4" y="8" width="16" height="11" rx="3" /><path d="M12 8V4M9 13h.01M15 13h.01M2 13h2M20 13h2" /></svg>
  ),
  webhook: (p: IconProps) => (
    <svg {...base(p)}><path d="M9 7a3 3 0 1 1 4.5 2.6L11 14" /><path d="M7 14a3 3 0 1 0 3 3h6" /><path d="M16 11a3 3 0 1 1-1.5 5.6" /></svg>
  ),
  link: (p: IconProps) => (
    <svg {...base(p)}><path d="M10 14a4 4 0 0 0 6 .5l2-2A4 4 0 0 0 12 7l-1 1" /><path d="M14 10a4 4 0 0 0-6-.5l-2 2A4 4 0 0 0 12 17l1-1" /></svg>
  ),
  chart: (p: IconProps) => (
    <svg {...base(p)}><path d="M4 20V10M10 20V4M16 20v-6M22 20H2" /></svg>
  ),
  report: (p: IconProps) => (
    <svg {...base(p)}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z" /><path d="M14 3v6h6M9 14l2 2 4-4" /></svg>
  ),
  check: (p: IconProps) => (
    <svg {...base(p)}><path d="m5 12 5 5L20 7" /></svg>
  ),
  arrow: (p: IconProps) => (
    <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  ),
  whatsapp: (p: IconProps) => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  ),
  facebook: (p: IconProps) => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  ),
  menu: (p: IconProps) => (
    <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
  ),
  close: (p: IconProps) => (
    <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
  ),
  sun: (p: IconProps) => (
    <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
  ),
  moon: (p: IconProps) => (
    <svg {...base(p)}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
  ),
  doubleTick: (p: IconProps) => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 12l5 5 9-11" /><path d="M9 14l1 1 9-11" />
    </svg>
  ),
};

export type IconName = keyof typeof Icon;
