-- Data de entrega escolhida no checkout.
alter table public.orders
  add column if not exists scheduled_date date;

create index if not exists orders_scheduled_date_pending_idx
  on public.orders (scheduled_date)
  where status = 'pending';
