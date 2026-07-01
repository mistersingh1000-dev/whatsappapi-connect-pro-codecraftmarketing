import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!cached) cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
  plan: "trial" | "paid" | "expired";
  trial_ends_at: string;
  waba_id: string | null;
  phone_number_id: string | null;
  wa_token: string | null;
  created_at: string;
};
