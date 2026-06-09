# Deploy em produção (Vercel + AbacatePay + Supabase)

Site: **https://locafull.vercel.app**

Checkout online via **AbacatePay**: **Pix** (checkout transparente, QR Code em modal) + **cartão** (checkout hospedado). O pedido é criado como `pending` e confirmado pelo webhook.

## Desenvolvimento local (`.env.local`)

O `.env.example` e o seu `.env.local` têm blocos comentados **LOCAL** vs **PRODUÇÃO** para `NEXT_PUBLIC_SITE_URL`. Deixe **uma linha ativa**. Após trocar, reinicie `pnpm dev`.

- **Local:** a AbacatePay chama uma URL pública. Use um túnel (ngrok/cloudflare) apontando para `/api/abacatepay/webhook?webhookSecret=...` ou simule o pagamento Pix no dev-mode da AbacatePay.
- **Produção no PC:** descomente a URL de produção (ou teste direto em locafull.vercel.app).

---

## 1. Variáveis na Vercel

**Vercel** → projeto **locafull** → **Settings** → **Environment Variables** → marque **Production** (e Preview se quiser o mesmo fluxo em PRs).

| Variável                        | Valor                                          |
| ------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | `https://locafull.vercel.app`                  |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`   | `556230300077`                                 |
| `NEXT_PUBLIC_INSTAGRAM_URL`     | `https://www.instagram.com/locafull_locacoes/` |
| `ABACATEPAY_API_KEY`            | chave de API (dev ou produção)                 |
| `ABACATEPAY_WEBHOOK_SECRET`     | secret do webhook (vai na query string)        |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://jjehzvrhjdhznzahdfxq.supabase.co`     |
| `SUPABASE_SECRET_KEY`           | `sb_secret_…` (só servidor)                    |
| `TRELLO_API_KEY`                | API key do Trello                              |
| `TRELLO_TOKEN`                  | token do Trello                                |
| `TRELLO_BOARD_ID`               | ID do board da operação                        |
| `TRELLO_MAX_DELIVERIES_PER_DAY` | `6` (opcional; default 6)                      |
| `TRELLO_LIST_ID_A_AGENDAR`      | fallback se pedido antigo sem data             |
| `TRELLO_LABEL_ID_ENTREGAR`      | label verde/laranja "Entregar" nos cards       |

Depois: **Deployments** → ⋯ no último deploy → **Redeploy** (para carregar as variáveis).

## 2. Conta e produtos na AbacatePay

1. Crie a conta na [AbacatePay](https://www.abacatepay.com/) e conclua o KYC.
2. Crie os produtos para os planos vendáveis no **cartão** (Pix não usa product ID).
3. Os IDs de produção já estão em `src/components/pricing/constants.ts`. Se recriar produtos no painel, atualize os `abacateProductId` e faça deploy.

## 3. Webhook AbacatePay (produção)

A AbacatePay chama a URL pública do site (não use túnel na Vercel).

1. No painel da AbacatePay, registre o webhook apontando para:
   `https://locafull.vercel.app/api/abacatepay/webhook?webhookSecret=...`
2. Use em `webhookSecret` o mesmo valor de `ABACATEPAY_WEBHOOK_SECRET` configurado na Vercel.

## 4. Conferir deploy

1. Abra https://locafull.vercel.app/pricing
2. Faça um pedido de teste (Pix no dev-mode ou cartão).
3. **AbacatePay** → confira o pagamento confirmado e a chamada do webhook.
4. **Supabase** → Table Editor → `orders` → linha com `status = 'paid'`.

## 5. Local vs produção

|            | Local                                                           | Vercel                                                                              |
| ---------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Webhook    | túnel → `/api/abacatepay/webhook?webhookSecret=...` ou dev-mode | AbacatePay → `https://locafull.vercel.app/api/abacatepay/webhook?webhookSecret=...` |
| Secret     | `ABACATEPAY_WEBHOOK_SECRET` no `.env.local`                     | `ABACATEPAY_WEBHOOK_SECRET` na Vercel                                               |
| PC ligado? | Sim                                                             | Não                                                                                 |

## 6. Sair do Dev Mode (dinheiro real)

O site já está em produção na Vercel. Para aceitar pagamentos reais:

1. Conclua o **KYC** no painel da AbacatePay.
2. Gere a **chave de API de produção** (não começa com `abc_dev_`).
3. Na Vercel, troque `ABACATEPAY_API_KEY` pela chave de produção → **Redeploy**.
4. No painel **Produção** da AbacatePay, cadastre o webhook:
   `https://locafull.vercel.app/api/abacatepay/webhook?webhookSecret=SEU_SECRET`
5. Confirme que os produtos de cartão existem no ambiente **Produção** (IDs em `constants.ts`).
6. Faça **1 Pix real** de teste e confira Trello + Supabase.

### Agendamento de entrega

- O checkout exige **data de entrega** (seg–sáb, mínimo 1 dia de antecedência, até 30 dias).
- Disponibilidade: colunas **ENTREGAR** no Trello + reservas `pending` no Supabase (máx. 6/dia).
- Após pagamento, o card vai na coluna `ENTREGAR - {DIA} - {DD/MM}` (criada automaticamente se não existir).
- Configure `TRELLO_BOARD_ID` na Vercel (obrigatório para agendamento).

| Ambiente AbacatePay | Chave API     | Pagamento               |
| ------------------- | ------------- | ----------------------- |
| Dev Mode            | `abc_dev_…`   | Simulado (como testado) |
| Produção            | chave de prod | Dinheiro real           |

## Troubleshooting

- **Pagamento ok, sem linha no Supabase:** falta `ABACATEPAY_WEBHOOK_SECRET` na Vercel, `webhookSecret` divergente na URL do webhook, ou redeploy pendente.
- **Webhook 400/500:** ver **Logs** da Vercel (Functions) e a entrega do webhook no painel da AbacatePay.
- **Redirect errado após pagar:** `NEXT_PUBLIC_SITE_URL` deve ser `https://locafull.vercel.app` (sem barra no final).
- **Cartão não abre checkout:** produto sem `abacateProductId` ou ID inválido no ambiente (dev vs produção).
