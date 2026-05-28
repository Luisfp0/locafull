-- Generaliza orders para AbacatePay (Pix + cartão) e pedidos pending.
-- Rode no SQL Editor do Supabase: https://supabase.com/dashboard/project/_/sql

alter table public.orders
  add column if not exists payment_provider text not null default 'abacatepay',
  add column if not exists payment_method text,
  add column if not exists payment_id text;

-- Marca pedidos antigos como Stripe e copia o identificador.
update public.orders
  set payment_provider = 'stripe',
      payment_id = stripe_session_id
  where payment_id is null and stripe_session_id is not null;

-- stripe_session_id deixa de ser obrigatório (pedidos novos não usam).
alter table public.orders alter column stripe_session_id drop not null;

-- Novos status (pending até o webhook confirmar).
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'paid', 'expired', 'cancelled'));

-- Unicidade do pagamento (nulos múltiplos permitidos para pending).
create unique index if not exists orders_payment_id_key
  on public.orders (payment_id)
  where payment_id is not null;
