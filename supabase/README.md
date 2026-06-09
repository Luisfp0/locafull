# Supabase — Locafull

## 1. Migrações

No painel do projeto **locafull**, abra **SQL Editor** e execute, nesta ordem:

1. `migrations/20260520120000_create_orders.sql`
2. `migrations/20260528120000_orders_abacatepay.sql` (colunas genéricas de pagamento: `payment_provider`, `payment_method`, `payment_id`)
3. `migrations/20260603120000_orders_scheduled_date.sql` (`scheduled_date` para agendamento de entrega)

## 2. Variáveis de ambiente

Em **Settings → API**:

| Variável                   | Valor                                       |
| -------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (`https://….supabase.co`)       |
| `SUPABASE_SECRET_KEY`      | Secret key (`sb_secret_…`) — só no servidor |

A publishable key (`sb_publishable_…`) não é usada neste fluxo (webhook no servidor).

## 3. Webhook AbacatePay

O pedido é confirmado quando a AbacatePay chama:

`https://locafull.vercel.app/api/abacatepay/webhook?webhookSecret=...`

Detalhes de configuração: [`docs/deploy-producao.md`](../docs/deploy-producao.md).

## 4. Conferir pedido

Após um pagamento, veja a tabela **orders** em **Table Editor** no Supabase (`status = 'paid'` após webhook).
