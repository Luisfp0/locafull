# Deploy em produção (Vercel + Stripe + Supabase)

Site: **https://locafull.vercel.app**

## Desenvolvimento local (`.env.local`)

O `.env.example` e o seu `.env.local` têm blocos comentados **LOCAL** vs **PRODUÇÃO** para `NEXT_PUBLIC_SITE_URL` e `STRIPE_WEBHOOK_SECRET`. Deixe **uma linha ativa** de cada. Após trocar, reinicie `pnpm dev`.

- **Local:** `stripe listen` + `whsec_` do terminal
- **Produção no PC:** descomente URL e webhook do Dashboard (ou teste direto em locafull.vercel.app)

---

## 1. Variáveis na Vercel

**Vercel** → projeto **locafull** → **Settings** → **Environment Variables** → marque **Production** (e Preview se quiser o mesmo fluxo em PRs).

| Variável                             | Valor                                              |
| ------------------------------------ | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`               | `https://locafull.vercel.app`                      |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`        | `556230300077`                                     |
| `NEXT_PUBLIC_INSTAGRAM_URL`          | `https://www.instagram.com/locafull_locacoes/`     |
| `STRIPE_SECRET_KEY`                  | `sk_test_…` ou `sk_live_…` (mesmo modo do webhook) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` ou `pk_live_…`                         |
| `STRIPE_WEBHOOK_SECRET`              | `whsec_…` do passo 2                               |
| `STRIPE_PAYMENT_METHODS`             | `card`                                             |
| `NEXT_PUBLIC_SUPABASE_URL`           | `https://jjehzvrhjdhznzahdfxq.supabase.co`         |
| `SUPABASE_SECRET_KEY`                | `sb_secret_…` (só servidor)                        |

Depois: **Deployments** → ⋯ no último deploy → **Redeploy** (para carregar as variáveis).

## 2. Webhook Stripe (produção)

**Não use** `stripe listen` na Vercel. A Stripe chama a URL pública do site.

1. [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks) (modo **Teste** enquanto usar `sk_test_`)
2. Deve existir endpoint: `https://locafull.vercel.app/api/stripe/webhook`
3. Evento: `checkout.session.completed`
4. Abra o endpoint → **Signing secret** → copie `whsec_…` → cole em `STRIPE_WEBHOOK_SECRET` na Vercel

Criar manualmente (CLI), se precisar:

```bash
stripe webhook_endpoints create \
  --url="https://locafull.vercel.app/api/stripe/webhook" \
  -d "enabled_events[0]=checkout.session.completed"
```

## 3. Conferir deploy

1. Abra https://locafull.vercel.app/pricing
2. Faça um pedido de teste com cartão `4242 4242 4242 4242`
3. **Stripe** → Webhooks → endpoint → ver evento com status **200**
4. **Supabase** → Table Editor → `orders` → nova linha

## 4. Modo teste vs live

| Ambiente      | Chaves Stripe           | Webhook no Dashboard              |
| ------------- | ----------------------- | --------------------------------- |
| Teste (agora) | `sk_test_` / `pk_test_` | Aba **Test mode**                 |
| Dinheiro real | `sk_live_` / `pk_live_` | Aba **Live mode** + novo endpoint |

Chaves e webhook precisam ser do **mesmo modo** (test com test, live com live).

## 5. Local vs produção

|            | Local                       | Vercel                                                    |
| ---------- | --------------------------- | --------------------------------------------------------- |
| Webhook    | `stripe listen` → localhost | Stripe → `https://locafull.vercel.app/api/stripe/webhook` |
| Secret     | `whsec_` do CLI             | `whsec_` do Dashboard (endpoint de produção)              |
| PC ligado? | Sim                         | Não                                                       |

## Troubleshooting

- **Pagamento ok, sem linha no Supabase:** falta `STRIPE_WEBHOOK_SECRET` na Vercel ou redeploy pendente.
- **Webhook 400/500:** ver **Logs** da Vercel (Functions) e o evento no Stripe Dashboard.
- **Redirect errado após pagar:** `NEXT_PUBLIC_SITE_URL` deve ser `https://locafull.vercel.app` (sem barra no final).
