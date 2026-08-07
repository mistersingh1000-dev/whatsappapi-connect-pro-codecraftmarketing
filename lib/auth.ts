import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me-in-production"
);

export const COOKIE_NAME = "wcp_session";
export const TRIAL_DAYS = Number(process.env.TRIAL_DAYS || 7);
export const SESSION_DAYS = 30; // how long a login lasts before re-auth

export type Session = JWTPayload & {
  sub: string; // email
  name: string;
  plan: "trial" | "free" | "paid" | "expired";
  trialEndsAt: string; // ISO snapshot (DB is source of truth when configured)
};

// Session lasts SESSION_DAYS so users can log back in (read-only after trial).
export async function createSession(data: {
  email: string;
  name: string;
  plan?: Session["plan"];
  trialEndsAt: string;
}) {
  return new SignJWT({
    name: data.name,
    plan: data.plan ?? "trial",
    trialEndsAt: data.trialEndsAt,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(data.email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret);
}

export async function verifySession(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as Session;
  } catch {
    return null;
  }
}

export function trialDaysLeft(trialEndsAt: string): number {
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function newTrialEnd(): string {
  return new Date(Date.now() + TRIAL_DAYS * 86_400_000).toISOString();
}
