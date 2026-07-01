# Supabase setup (accounts, login, connected numbers)

The app works without Supabase (cookie-only trial). Adding it enables real
returning-user login, hashed passwords, one-trial-per-email, and storing each
customer's connected WhatsApp number from Embedded Signup.

## 1. Create a project
1. Go to https://supabase.com → sign in → New project.
2. Pick a name, a strong database password, and a region near your users.
3. Wait ~2 minutes for it to provision.

## 2. Create the users table
Open the **SQL Editor**, paste this, and click **Run**:

```sql
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  password_hash text not null,
  plan text not null default 'trial',
  trial_ends_at timestamptz not null,
  waba_id text,
  phone_number_id text,
  wa_token text,
  created_at timestamptz not null default now()
);

alter table public.app_users enable row level security;
-- No policies: only the server-side service-role key can access this table.
```

### Already created the table earlier? Add the new columns:
```sql
alter table public.app_users add column if not exists waba_id text;
alter table public.app_users add column if not exists phone_number_id text;
alter table public.app_users add column if not exists wa_token text;
```

## 3. Get your keys
In **Project Settings → API**:
- **Project URL** → `SUPABASE_URL`
- **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never in client code)

## 4. Add them in Vercel
Settings → Environment Variables → add both for Production and Preview → **Redeploy**.

## 5. Mark a user as paid (after payment)
```sql
update public.app_users set plan = 'paid' where email = 'customer@example.com';
```

## Note on wa_token
The customer's business token is stored in `wa_token` so their own number can
send messages. In production you should encrypt this column (e.g. Supabase Vault)
rather than storing it in plain text.
