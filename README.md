# Clear — Whop App

A minimal to‑do app with optional cloud sync, packaged as a Whop App with Free (local) and Pro (cloud) tiers.

## Quick start (local)

1. Copy environment file:

```bash
cp app/.env.example app/.env.local
```

2. Run locally:

```bash
cd app
npm install
npm run dev
```

The Free tier (local storage) works without any credentials.

## Enable Pro (cloud) with Supabase

Set these in `app/.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Create table in Supabase:

```sql
create table if not exists public.clear_tasks (
  user_id text not null,
  date text not null,
  tasks jsonb not null default '[]'::jsonb,
  primary key (user_id, date)
);
```

## Whop integration

- Whop SDK and dev proxy configured in `app/package.json`.
- Entitlement endpoint: `pages/api/whop/entitlement` detects Pro access via Whop headers (from Whop or the dev proxy).
- UI gates Pro features and renders an Upgrade link using `NEXT_PUBLIC_WHOP_CHECKOUT_URL`.

Environment variables:

- `NEXT_PUBLIC_WHOP_APP_ID`
- `WHOP_API_KEY`
- `NEXT_PUBLIC_WHOP_CHECKOUT_URL` (checkout link to your Whop plan)
- `FORCE_WHOP_PRO=true` to simulate entitlement during development

### Dev proxy (optional)

```bash
cd app
npm run dev
# in another terminal
npm run dev:whop
```

Open the proxy URL as documented by Whop to inject headers.

## Deploy

Deploy the `app` directory (Next.js 14). Set the same env vars in your host.

