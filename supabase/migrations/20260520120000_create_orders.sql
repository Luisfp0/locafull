-- Pedidos confirmados via Stripe Checkout (webhook).
-- Rode no SQL Editor do Supabase: https://supabase.com/dashboard/project/_/sql

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  status text not null default 'paid' check (status in ('paid')),
  product_id text not null,
  plan_id text not null,
  amount_cents integer not null check (amount_cents > 0),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  postal_code text not null,
  street text not null,
  number text not null,
  complement text,
  neighborhood text not null,
  city text not null,
  notes text,
  delivery_address text not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Sem policies para anon/authenticated: acesso só via secret key no servidor (bypass RLS).
