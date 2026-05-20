# Locafull — Checkout Pix (Stripe)

**Data:** 2026-05-19  
**Status:** Implementado  
**Escopo:** Formulário em `/order`, Checkout Session Pix, webhook, páginas success/cancel — **sem catálogo de produtos na Stripe**

---

## 1. Objetivo

Permitir pagamento **Pix** após o cliente escolher equipamento/plano e preencher **dados de entrega** no Locafull. Preços vêm de `components/pricing/constants.ts` (`price_data` dinâmico).

**MVP pós-pagamento:** página de sucesso + pedido visível no Dashboard Stripe + metadata no webhook (log). Sem banco de dados.

---

## 2. Fluxo

```
/pricing → /order?product=&plan=
  → formulário (nome, e-mail, telefone, endereço)
  → POST /api/stripe/checkout
  → redirect Stripe Checkout (Pix)
  → /checkout/success | /checkout/cancel
  → POST /api/stripe/webhook (checkout.session.completed)
```

---

## 3. Formulário (opção A)

| Campo            | Obrigatório           |
| ---------------- | --------------------- |
| Nome completo    | Sim                   |
| E-mail           | Sim                   |
| Telefone         | Sim                   |
| CEP              | Sim                   |
| Endereço, número | Sim                   |
| Complemento      | Não                   |
| Bairro, cidade   | Sim (default Goiânia) |
| Observações      | Não                   |

Componente: `components/order/OrderPage/components/OrderForm/`

---

## 4. API (Next.js)

| Rota                        | Função                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `POST /api/stripe/checkout` | Valida payload; `findPricingPlanPrice`; cria Checkout Session (`payment_method_types: ['pix']`, BRL) |
| `POST /api/stripe/webhook`  | Verifica assinatura; log em `checkout.session.completed`                                             |

`lib/stripe.ts` — cliente Stripe (secret só no servidor).

---

## 5. Env

```env
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

Local: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

---

## 6. Fora do escopo

- Cartão, Products/Prices no Dashboard Stripe
- Banco de dados, e-mail automático
- ViaCEP
