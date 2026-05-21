# Supabase — Locafull

## 1. Criar tabela `orders`

No painel do projeto **locafull**, abra **SQL Editor** e execute o arquivo:

`migrations/20260520120000_create_orders.sql`

## 2. Variáveis de ambiente

Em **Settings → API**:

| Variável                   | Valor                                       |
| -------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (`https://….supabase.co`)       |
| `SUPABASE_SECRET_KEY`      | Secret key (`sb_secret_…`) — só no servidor |

A publishable key (`sb_publishable_…`) não é usada neste fluxo (webhook no servidor).

## 3. Webhook Stripe (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copie o `whsec_…` para `STRIPE_WEBHOOK_SECRET` no `.env.local`.

## 4. Conferir pedido

Após um pagamento de teste, veja a tabela **orders** em **Table Editor** no Supabase.
