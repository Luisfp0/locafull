# Checkout AbacatePay (Pix + cartão) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a Stripe pelo AbacatePay no checkout do Locafull — Pix via checkout transparente (QR no modal) e cartão via checkout hospedado (redirect) — persistindo pedido `pending` no Supabase e confirmando via webhook, mantendo a criação de card no Trello.

**Architecture:** O front envia o formulário + forma de pagamento para `POST /api/abacatepay/orders`, que cria um pedido `pending` no Supabase (id UUID gerado no app) e abre a cobrança na AbacatePay (`externalId = orderId`). Pix retorna `brCode`/`brCodeBase64` exibidos no modal com polling de status; cartão retorna `url` de redirect. O webhook `POST /api/abacatepay/webhook` valida secret + assinatura HMAC, marca o pedido como `paid` (idempotente) e cria o card no Trello.

**Tech Stack:** Next.js 16 (App Router, route handlers), TypeScript, Supabase JS, AbacatePay REST v2 (`fetch`), Vitest, Tailwind.

**Spec:** `docs/superpowers/specs/2026-05-28-abacatepay-checkout-design.md`

---

## File Structure

**Criar:**

- `src/lib/abacatepay/types.ts` — tipos de input/output e do payload de webhook
- `src/lib/abacatepay/client.ts` — `fetch` autenticado (Bearer) + tratamento de erro
- `src/lib/abacatepay/create-pix-charge.ts` — cobrança Pix transparente
- `src/lib/abacatepay/create-card-checkout.ts` — checkout hospedado de cartão
- `src/lib/abacatepay/verify-webhook.ts` — validação de secret e assinatura HMAC
- `src/lib/orders/insert-pending-order.ts` — grava pedido `pending`
- `src/lib/orders/confirm-order.ts` — confirma pedido pelo webhook + Trello (idempotente)
- `src/lib/orders/webhook-utils.ts` — parser puro do evento → `{ orderId, paymentId }`
- `src/lib/orders/webhook-utils.test.ts` — testes do parser
- `src/app/api/abacatepay/orders/route.ts` — cria pending + cobrança
- `src/app/api/abacatepay/webhook/route.ts` — confirma pagamento
- `src/app/api/abacatepay/orders/[orderId]/status/route.ts` — polling de status
- `src/components/order/OrderCheckoutModal/components/PaymentMethodChoice/index.tsx` + `types.ts`
- `src/components/order/OrderCheckoutModal/components/OrderPixPayment/index.tsx` + `types.ts`

**Modificar:**

- `src/lib/orders/types.ts` — novo formato de `OrderInsertRow`
- `src/lib/trello/build-card.ts` — usar `payment_id`/`payment_method` em vez de `stripe_session_id`
- `src/lib/trello/build-card.test.ts` — ajustar fixture e asserts
- `src/components/pricing/types.ts` — `abacateProductId?` em plano/combo
- `src/components/pricing/constants.ts` — IDs de produto Abacate
- `src/components/pricing/utils.ts` — `findAbacateProductId`
- `src/components/order/types.ts` — `OrderPaymentMethod`
- `src/components/order/OrderCheckoutModal/components/OrderForm/index.tsx` — escolha de pagamento + Pix/redirect
- `src/components/order/OrderCheckoutModal/components/OrderForm/types.ts` — props
- `src/components/checkout/CheckoutSuccessPage/index.tsx` — copy genérica (sem `session_id`)
- `.env.example` — remover Stripe, adicionar Abacate
- `supabase/migrations/` — nova migração
- `README.md`, `docs/deploy-producao.md` — referências Stripe → Abacate

**Remover:**

- `src/lib/stripe.ts`, `src/lib/stripe-payment-methods.ts`
- `src/app/api/stripe/checkout/route.ts`, `src/app/api/stripe/webhook/route.ts`
- `src/lib/orders/insert-order.ts`, `src/lib/orders/utils.ts`, `src/lib/orders/utils.test.ts` (substituídos)
- pacote `stripe`

---

## Task 1: Tipos da AbacatePay

**Files:**

- Create: `src/lib/abacatepay/types.ts`

- [ ] **Step 1: Criar o arquivo de tipos**

```ts
export type AbacatePixCustomer = {
  name: string;
  email: string;
  cellphone: string;
};

export type CreatePixChargeInput = {
  amountCents: number;
  description: string;
  externalId: string;
  customer: AbacatePixCustomer;
};

export type PixCharge = {
  id: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string | null;
  status: string;
};

export type CreateCardCheckoutInput = {
  abacateProductId: string;
  externalId: string;
  completionUrl: string;
  returnUrl: string;
};

export type CardCheckout = {
  id: string;
  url: string;
};

type AbacateWebhookEntity = {
  id?: string;
  externalId?: string;
  status?: string;
  amount?: number;
};

export type AbacateWebhookEvent = {
  event?: string;
  data?: {
    transparent?: AbacateWebhookEntity;
    checkout?: AbacateWebhookEntity;
  };
};
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (nenhum import quebrado; arquivo isolado)

- [ ] **Step 3: Commit**

```bash
git add src/lib/abacatepay/types.ts
git commit -m "feat(abacatepay): tipos de cobrança e webhook"
```

---

## Task 2: Cliente HTTP da AbacatePay

**Files:**

- Create: `src/lib/abacatepay/client.ts`

- [ ] **Step 1: Criar o cliente**

```ts
const BASE_URL = "https://api.abacatepay.com/v2";

function getApiKey(): string {
  const key = process.env.ABACATEPAY_API_KEY?.trim();

  if (!key) {
    throw new Error("ABACATEPAY_API_KEY is not configured.");
  }

  return key;
}

export async function abacatePost<T>(
  path: string,
  body: unknown,
): Promise<{ data: T } | { error: string }> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = (await response.json().catch(() => null)) as {
      data?: T;
      error?: string | null;
    } | null;

    if (!response.ok || !json || json.error || !json.data) {
      return {
        error: json?.error ?? `AbacatePay API ${response.status}`,
      };
    }

    return { data: json.data };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Erro de rede ao chamar a AbacatePay.",
    };
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/abacatepay/client.ts
git commit -m "feat(abacatepay): cliente HTTP autenticado"
```

---

## Task 3: Criar cobrança Pix

**Files:**

- Create: `src/lib/abacatepay/create-pix-charge.ts`

- [ ] **Step 1: Implementar**

```ts
import { abacatePost } from "./client";
import type { CreatePixChargeInput, PixCharge } from "./types";

type PixChargeResponse = {
  id?: string;
  brCode?: string;
  brCodeBase64?: string;
  expiresAt?: string;
  status?: string;
};

export async function createPixCharge(
  input: CreatePixChargeInput,
): Promise<{ charge: PixCharge } | { error: string }> {
  const result = await abacatePost<PixChargeResponse>("/transparents/create", {
    method: "PIX",
    data: {
      amount: input.amountCents,
      description: input.description,
      expiresIn: 3600,
      externalId: input.externalId,
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        cellphone: input.customer.cellphone,
      },
      metadata: { orderId: input.externalId },
    },
  });

  if ("error" in result) {
    return result;
  }

  const { id, brCode, brCodeBase64, expiresAt, status } = result.data;

  if (!id || !brCode || !brCodeBase64) {
    return { error: "Resposta Pix incompleta da AbacatePay." };
  }

  return {
    charge: {
      id,
      brCode,
      brCodeBase64,
      expiresAt: expiresAt ?? null,
      status: status ?? "PENDING",
    },
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/abacatepay/create-pix-charge.ts
git commit -m "feat(abacatepay): criar cobrança Pix transparente"
```

---

## Task 4: Criar checkout de cartão

**Files:**

- Create: `src/lib/abacatepay/create-card-checkout.ts`

- [ ] **Step 1: Implementar**

```ts
import { abacatePost } from "./client";
import type { CardCheckout, CreateCardCheckoutInput } from "./types";

type CardCheckoutResponse = {
  id?: string;
  url?: string;
};

export async function createCardCheckout(
  input: CreateCardCheckoutInput,
): Promise<{ checkout: CardCheckout } | { error: string }> {
  const result = await abacatePost<CardCheckoutResponse>("/checkouts/create", {
    items: [{ id: input.abacateProductId, quantity: 1 }],
    methods: ["CARD"],
    externalId: input.externalId,
    completionUrl: input.completionUrl,
    returnUrl: input.returnUrl,
    metadata: { orderId: input.externalId },
  });

  if ("error" in result) {
    return result;
  }

  const { id, url } = result.data;

  if (!id || !url) {
    return { error: "Resposta de checkout incompleta da AbacatePay." };
  }

  return { checkout: { id, url } };
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/abacatepay/create-card-checkout.ts
git commit -m "feat(abacatepay): criar checkout hospedado de cartão"
```

---

## Task 5: Validação de webhook (secret + HMAC)

**Files:**

- Create: `src/lib/abacatepay/verify-webhook.ts`

- [ ] **Step 1: Implementar**

A chave pública HMAC é a constante divulgada na doc da AbacatePay (mesma para todas as lojas); pode ser sobrescrita por env.

```ts
import crypto from "node:crypto";

const DEFAULT_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

function getPublicKey(): string {
  return process.env.ABACATEPAY_WEBHOOK_HMAC_KEY?.trim() || DEFAULT_PUBLIC_KEY;
}

export function isValidWebhookSecret(provided: string | null): boolean {
  const expected = process.env.ABACATEPAY_WEBHOOK_SECRET?.trim();
  return Boolean(expected) && provided === expected;
}

export function isValidWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", getPublicKey())
    .update(Buffer.from(rawBody, "utf8"))
    .digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/abacatepay/verify-webhook.ts
git commit -m "feat(abacatepay): validar secret e assinatura HMAC do webhook"
```

---

## Task 6: Novo formato de `OrderInsertRow`

**Files:**

- Modify: `src/lib/orders/types.ts`

- [ ] **Step 1: Substituir o conteúdo do arquivo**

```ts
export type OrderPaymentMethod = "pix" | "card";

export type OrderStatus = "pending" | "paid" | "expired" | "cancelled";

export type OrderInsertRow = {
  id: string;
  payment_provider: "abacatepay";
  payment_method: OrderPaymentMethod;
  payment_id: string | null;
  status: OrderStatus;
  product_id: string;
  plan_id: string;
  amount_cents: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  postal_code: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  notes: string | null;
  delivery_address: string;
};
```

- [ ] **Step 2: Typecheck (vai falhar — esperado)**

Run: `pnpm typecheck`
Expected: FAIL em `src/lib/orders/insert-order.ts`, `src/lib/orders/utils.ts`, `src/lib/trello/build-card.ts` e testes que usam `stripe_session_id`. Esses arquivos serão corrigidos/removidos nas próximas tasks.

- [ ] **Step 3: Commit**

```bash
git add src/lib/orders/types.ts
git commit -m "refactor(orders): generalizar OrderInsertRow para AbacatePay"
```

---

## Task 7: Trello usa `payment_id`/`payment_method`

**Files:**

- Modify: `src/lib/trello/build-card.ts:20-36`
- Test: `src/lib/trello/build-card.test.ts`

- [ ] **Step 1: Atualizar a fixture e os asserts do teste**

Substituir o objeto `row` e o assert da última linha em `src/lib/trello/build-card.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import type { OrderInsertRow } from "@/lib/orders/types";

import { buildTrelloCardFromOrder } from "./build-card";

const row: OrderInsertRow = {
  id: "11111111-1111-1111-1111-111111111111",
  payment_provider: "abacatepay",
  payment_method: "pix",
  payment_id: "pix_char_abc123xyz",
  status: "paid",
  product_id: "mini-dumpster",
  plan_id: "48h",
  amount_cents: 18000,
  customer_name: "Maria Silva",
  customer_email: "maria@exemplo.com",
  customer_phone: "62999999999",
  postal_code: "74000000",
  street: "Rua A",
  number: "10",
  complement: "casa 2",
  neighborhood: "Jardim América",
  city: "Goiânia",
  notes: "Entregar de manhã",
  delivery_address: "Rua A, 10 · Jardim América · Goiânia",
};

describe("buildTrelloCardFromOrder", () => {
  it("monta título e descrição do card", () => {
    const card = buildTrelloCardFromOrder(row);

    expect(card.name).toBe("Mini caçamba — Jardim América");
    expect(card.desc).toContain("Nome: Maria Silva");
    expect(card.desc).toContain("Telefone: 62999999999");
    expect(card.desc).toContain("Rua A, 10 — casa 2");
    expect(card.desc).toContain("Plano: Aluguel 48h");
    expect(card.desc).toMatch(/Valor pago: R\$\s?180,00/);
    expect(card.desc).toContain("Observações: Entregar de manhã");
    expect(card.desc).toContain("pix_char_abc123xyz");
    expect(card.desc).toContain("Pix");
  });
});
```

- [ ] **Step 2: Rodar o teste para vê-lo falhar**

Run: `pnpm test src/lib/trello/build-card.test.ts`
Expected: FAIL (build-card ainda referencia `stripe_session_id`)

- [ ] **Step 3: Atualizar `build-card.ts`**

Substituir o bloco final do `desc` (linha `Pedido Stripe: ...`) por método/identificador AbacatePay:

```ts
import {
  findPricingPlanLabel,
  findPricingProduct,
} from "@/components/pricing/utils";
import type { OrderInsertRow } from "@/lib/orders/types";
import { formatBRL } from "@/lib/utils";

import type { TrelloCardPayload } from "./types";

const PAYMENT_METHOD_LABEL: Record<OrderInsertRow["payment_method"], string> = {
  pix: "Pix",
  card: "Cartão",
};

export function buildTrelloCardFromOrder(
  row: OrderInsertRow,
): TrelloCardPayload {
  const product = findPricingProduct(row.product_id);
  const planLabel = findPricingPlanLabel(row.product_id, row.plan_id);
  const productName = product?.name ?? row.product_id;

  const complement = row.complement ? ` — ${row.complement}` : "";
  const notesBlock = row.notes ? `\n\nObservações: ${row.notes}` : "";

  return {
    name: `${productName} — ${row.neighborhood}`,
    desc: [
      `Nome: ${row.customer_name}`,
      `Telefone: ${row.customer_phone}`,
      `E-mail: ${row.customer_email}`,
      "",
      `Endereço: ${row.street}, ${row.number}${complement}`,
      `${row.neighborhood}, ${row.city}`,
      `CEP: ${row.postal_code}`,
      "",
      `Plano: ${planLabel ?? row.plan_id}`,
      `Valor pago: ${formatBRL(row.amount_cents)}${notesBlock}`,
      "",
      `Pagamento: ${PAYMENT_METHOD_LABEL[row.payment_method]}`,
      `Pedido AbacatePay: ${row.payment_id ?? row.id}`,
    ].join("\n"),
  };
}
```

- [ ] **Step 4: Rodar o teste para vê-lo passar**

Run: `pnpm test src/lib/trello/build-card.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/trello/build-card.ts src/lib/trello/build-card.test.ts
git commit -m "refactor(trello): identificar pedido por pagamento AbacatePay"
```

---

## Task 8: Catálogo Abacate no pricing (cartão)

**Files:**

- Modify: `src/components/pricing/types.ts:1-13`
- Modify: `src/components/pricing/constants.ts`
- Modify: `src/components/pricing/utils.ts`

- [ ] **Step 1: Adicionar `abacateProductId` aos tipos**

Em `src/components/pricing/types.ts`, adicionar o campo opcional em `PricingPlan` e `PricingCombo`:

```ts
export type PricingPlan = {
  id: string;
  label: string;
  priceCents: number;
  note?: string;
  abacateProductId?: string;
};

export type PricingCombo = {
  id: string;
  label: string;
  priceCents: number;
  description?: string;
  abacateProductId?: string;
};
```

- [ ] **Step 2: Preencher os IDs reais no `constants.ts`**

Adicionar `abacateProductId` aos planos/combos vendíveis com cartão. **Os valores `prod_...` vêm do dashboard AbacatePay** (criados manualmente antes do deploy — ver checklist). Exemplo (substituir pelos IDs reais):

```ts
// mini-dumpster → plano 48h
{ id: "48h", label: "Aluguel 48h", priceCents: 18000, abacateProductId: "prod_SUBSTITUIR_MINI_48H" },
```

```ts
// drum → plano 5-days
{ id: "5-days", label: "Aluguel por 5 dias", priceCents: 13000, abacateProductId: "prod_SUBSTITUIR_TAMBOR_5D" },
```

```ts
// drum → combos
{ id: "combo-1", label: "1 tambor", priceCents: 15000, abacateProductId: "prod_SUBSTITUIR_COMBO_1" },
{ id: "combo-2", label: "2 tambores", priceCents: 20000, abacateProductId: "prod_SUBSTITUIR_COMBO_2" },
{ id: "combo-3", label: "3 tambores", priceCents: 25000, abacateProductId: "prod_SUBSTITUIR_COMBO_3" },
```

Planos `extra-day` e `second-unit` não recebem `abacateProductId` (não são vendidos isoladamente com cartão; cartão indisponível → API retorna 400 controlado).

- [ ] **Step 3: Adicionar `findAbacateProductId` em `utils.ts`**

Acrescentar ao final de `src/components/pricing/utils.ts`:

```ts
export function findAbacateProductId(
  productId: string,
  planId: string,
): string | undefined {
  const product = findPricingProduct(productId);
  if (!product) return undefined;

  const plan = product.plans.find((item) => item.id === planId);
  if (plan?.abacateProductId) return plan.abacateProductId;

  const combo = product.combos?.find((item) => item.id === planId);
  return combo?.abacateProductId;
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/pricing/types.ts src/components/pricing/constants.ts src/components/pricing/utils.ts
git commit -m "feat(pricing): mapear produtos AbacatePay para pagamento com cartão"
```

---

## Task 9: Parser puro do webhook (TDD)

**Files:**

- Create: `src/lib/orders/webhook-utils.ts`
- Test: `src/lib/orders/webhook-utils.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
import { describe, expect, it } from "vitest";

import { parseConfirmedOrderFromWebhook } from "./webhook-utils";

describe("parseConfirmedOrderFromWebhook", () => {
  it("extrai orderId e paymentId de transparent.completed (Pix)", () => {
    const result = parseConfirmedOrderFromWebhook({
      event: "transparent.completed",
      data: {
        transparent: { id: "char_1", externalId: "order-1", status: "PAID" },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.orderId).toBe("order-1");
    expect(result.paymentId).toBe("char_1");
  });

  it("extrai orderId e paymentId de checkout.completed (cartão)", () => {
    const result = parseConfirmedOrderFromWebhook({
      event: "checkout.completed",
      data: {
        checkout: { id: "bill_1", externalId: "order-2", status: "PAID" },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.orderId).toBe("order-2");
    expect(result.paymentId).toBe("bill_1");
  });

  it("ignora eventos não suportados", () => {
    const result = parseConfirmedOrderFromWebhook({
      event: "checkout.refunded",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.ignored).toBe(true);
  });

  it("falha quando faltam id/externalId", () => {
    const result = parseConfirmedOrderFromWebhook({
      event: "checkout.completed",
      data: { checkout: { status: "PAID" } },
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.ignored).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar o teste para vê-lo falhar**

Run: `pnpm test src/lib/orders/webhook-utils.test.ts`
Expected: FAIL com "parseConfirmedOrderFromWebhook is not a function" (módulo ainda não existe)

- [ ] **Step 3: Implementar `webhook-utils.ts`**

```ts
import type { AbacateWebhookEvent } from "@/lib/abacatepay/types";

const CONFIRM_EVENTS = ["transparent.completed", "checkout.completed"];

export type ParsedWebhookOrder =
  | { success: true; orderId: string; paymentId: string }
  | { success: false; ignored: boolean; error?: string };

export function parseConfirmedOrderFromWebhook(
  event: AbacateWebhookEvent,
): ParsedWebhookOrder {
  if (!event.event || !CONFIRM_EVENTS.includes(event.event)) {
    return { success: false, ignored: true };
  }

  const entity = event.data?.transparent ?? event.data?.checkout;
  const orderId = entity?.externalId?.trim();
  const paymentId = entity?.id?.trim();

  if (!orderId || !paymentId) {
    return {
      success: false,
      ignored: false,
      error: "Webhook sem externalId/id.",
    };
  }

  return { success: true, orderId, paymentId };
}
```

- [ ] **Step 4: Rodar o teste para vê-lo passar**

Run: `pnpm test src/lib/orders/webhook-utils.test.ts`
Expected: PASS (4 testes)

- [ ] **Step 5: Commit**

```bash
git add src/lib/orders/webhook-utils.ts src/lib/orders/webhook-utils.test.ts
git commit -m "feat(orders): parser do webhook AbacatePay"
```

---

## Task 10: Gravar pedido `pending`

**Files:**

- Create: `src/lib/orders/insert-pending-order.ts`

- [ ] **Step 1: Implementar**

Reutiliza `formatDeliveryAddress` e `OrderCheckoutPayload` já existentes em `src/components/order/`.

```ts
import { randomUUID } from "node:crypto";

import { formatDeliveryAddress } from "@/components/order/utils";
import type { OrderCheckoutPayload } from "@/components/order/types";
import { getSupabaseAdmin } from "@/lib/supabase";

import type { OrderInsertRow, OrderPaymentMethod } from "./types";

export async function insertPendingOrder(input: {
  payload: OrderCheckoutPayload;
  amountCents: number;
  paymentMethod: OrderPaymentMethod;
}): Promise<{ orderId: string } | { error: string }> {
  const orderId = randomUUID();
  const { payload } = input;

  const row: OrderInsertRow = {
    id: orderId,
    payment_provider: "abacatepay",
    payment_method: input.paymentMethod,
    payment_id: null,
    status: "pending",
    product_id: payload.productId,
    plan_id: payload.planId,
    amount_cents: input.amountCents,
    customer_name: payload.name,
    customer_email: payload.email,
    customer_phone: payload.phone,
    postal_code: payload.postalCode,
    street: payload.street,
    number: payload.number,
    complement: payload.complement ?? null,
    neighborhood: payload.neighborhood,
    city: payload.city,
    notes: payload.notes ?? null,
    delivery_address: formatDeliveryAddress(payload),
  };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("orders").insert(row);

  if (error) {
    console.error("[orders] pending insert failed", error);
    return { error: "Não foi possível registrar o pedido." };
  }

  return { orderId };
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (note: `insert-order.ts`/`utils.ts` antigos ainda existem e falham — serão removidos na Task 14; se o typecheck falhar só por eles, prossiga, pois a Task 14 os remove. Para manter o typecheck verde aqui, execute a Task 14 imediatamente após esta se preferir.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/orders/insert-pending-order.ts
git commit -m "feat(orders): gravar pedido pending antes do pagamento"
```

---

## Task 11: Confirmar pedido pelo webhook (idempotente + Trello)

**Files:**

- Create: `src/lib/orders/confirm-order.ts`

- [ ] **Step 1: Implementar**

```ts
import type { AbacateWebhookEvent } from "@/lib/abacatepay/types";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createTrelloCardForOrder } from "@/lib/trello/create-order-card";

import type { OrderInsertRow } from "./types";
import { parseConfirmedOrderFromWebhook } from "./webhook-utils";

export async function confirmOrderFromWebhook(
  event: AbacateWebhookEvent,
): Promise<{ confirmed: boolean } | { error: string }> {
  const parsed = parseConfirmedOrderFromWebhook(event);

  if (!parsed.success) {
    if (parsed.ignored) {
      return { confirmed: false };
    }
    return { error: parsed.error ?? "Webhook inválido." };
  }

  const supabase = getSupabaseAdmin();

  const { data: updated, error } = await supabase
    .from("orders")
    .update({ status: "paid", payment_id: parsed.paymentId })
    .eq("id", parsed.orderId)
    .eq("status", "pending")
    .select();

  if (error) {
    console.error("[orders] confirm update failed", {
      orderId: parsed.orderId,
      error,
    });
    return { error: "Falha ao confirmar pedido." };
  }

  if (!updated || updated.length === 0) {
    // Já confirmado por outro webhook (idempotência) ou pedido inexistente.
    return { confirmed: false };
  }

  const row = updated[0] as OrderInsertRow;
  const trelloResult = await createTrelloCardForOrder(row);

  if ("error" in trelloResult) {
    console.error("[trello] card create failed", {
      orderId: row.id,
      error: trelloResult.error,
    });
  } else if (trelloResult.created) {
    console.info("[trello] card created", {
      orderId: row.id,
      cardId: trelloResult.cardId,
    });
  }

  return { confirmed: true };
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (ignorando arquivos legados Stripe, removidos na Task 14)

- [ ] **Step 3: Commit**

```bash
git add src/lib/orders/confirm-order.ts
git commit -m "feat(orders): confirmar pedido via webhook com idempotência"
```

---

## Task 12: Route handler `POST /api/abacatepay/orders`

**Files:**

- Create: `src/app/api/abacatepay/orders/route.ts`

- [ ] **Step 1: Implementar**

```ts
import { NextResponse } from "next/server";

import type { OrderPaymentMethod } from "@/lib/orders/types";
import { validateOrderCheckoutPayload } from "@/components/order/utils";
import {
  buildPricingLineItemName,
  buildOrderHref,
  findAbacateProductId,
  findPricingPlanPrice,
  findPricingProduct,
} from "@/components/pricing/utils";
import { createCardCheckout } from "@/lib/abacatepay/create-card-checkout";
import { createPixCharge } from "@/lib/abacatepay/create-pix-charge";
import { SITE_URL } from "@/lib/constants";
import { insertPendingOrder } from "@/lib/orders/insert-pending-order";
import { ROUTES } from "@/lib/routes";

export const runtime = "nodejs";

function readPaymentMethod(body: unknown): OrderPaymentMethod | null {
  const value = (body as { paymentMethod?: unknown } | null)?.paymentMethod;
  return value === "pix" || value === "card" ? value : null;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const validation = validateOrderCheckoutPayload(body);

  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const paymentMethod = readPaymentMethod(body);

  if (!paymentMethod) {
    return NextResponse.json(
      { error: "Selecione a forma de pagamento." },
      { status: 400 },
    );
  }

  const { data } = validation;
  const product = findPricingProduct(data.productId);

  if (!product?.orderEnabled) {
    return NextResponse.json(
      { error: "Este equipamento não está disponível para pedido online." },
      { status: 400 },
    );
  }

  const priceCents = findPricingPlanPrice(data.productId, data.planId);
  const lineItemName = buildPricingLineItemName(data.productId, data.planId);

  if (!priceCents || !lineItemName) {
    return NextResponse.json(
      { error: "Plano ou preço inválido para este equipamento." },
      { status: 400 },
    );
  }

  const pending = await insertPendingOrder({
    payload: data,
    amountCents: priceCents,
    paymentMethod,
  });

  if ("error" in pending) {
    return NextResponse.json({ error: pending.error }, { status: 500 });
  }

  const { orderId } = pending;
  const baseUrl = SITE_URL.replace(/\/$/, "");

  if (paymentMethod === "pix") {
    const result = await createPixCharge({
      amountCents: priceCents,
      description: lineItemName,
      externalId: orderId,
      customer: { name: data.name, email: data.email, cellphone: data.phone },
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({
      method: "pix" as const,
      orderId,
      brCode: result.charge.brCode,
      brCodeBase64: result.charge.brCodeBase64,
      expiresAt: result.charge.expiresAt,
    });
  }

  const abacateProductId = findAbacateProductId(data.productId, data.planId);

  if (!abacateProductId) {
    return NextResponse.json(
      {
        error: "Pagamento com cartão indisponível para este plano. Tente Pix.",
      },
      { status: 400 },
    );
  }

  const checkout = await createCardCheckout({
    abacateProductId,
    externalId: orderId,
    completionUrl: `${baseUrl}${ROUTES.checkoutSuccess}?orderId=${orderId}`,
    returnUrl: `${baseUrl}${buildOrderHref(data.productId, data.planId)}`,
  });

  if ("error" in checkout) {
    return NextResponse.json({ error: checkout.error }, { status: 502 });
  }

  return NextResponse.json({
    method: "card" as const,
    orderId,
    url: checkout.checkout.url,
  });
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (ignorando legado Stripe até Task 14)

- [ ] **Step 3: Commit**

```bash
git add src/app/api/abacatepay/orders/route.ts
git commit -m "feat(api): rota de pedido AbacatePay (Pix + cartão)"
```

---

## Task 13: Route handlers de webhook e status

**Files:**

- Create: `src/app/api/abacatepay/webhook/route.ts`
- Create: `src/app/api/abacatepay/orders/[orderId]/status/route.ts`

- [ ] **Step 1: Implementar o webhook**

```ts
import { NextResponse } from "next/server";

import type { AbacateWebhookEvent } from "@/lib/abacatepay/types";
import {
  isValidWebhookSecret,
  isValidWebhookSignature,
} from "@/lib/abacatepay/verify-webhook";
import { confirmOrderFromWebhook } from "@/lib/orders/confirm-order";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const url = new URL(request.url);

  if (!isValidWebhookSecret(url.searchParams.get("webhookSecret"))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");

  if (!isValidWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: AbacateWebhookEvent;

  try {
    event = JSON.parse(rawBody) as AbacateWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const result = await confirmOrderFromWebhook(event);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Implementar o status (polling)**

```ts
import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ status: "unknown" }, { status: 404 });
  }

  return NextResponse.json({ status: data.status });
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (ignorando legado Stripe até Task 14)

- [ ] **Step 4: Commit**

```bash
git add src/app/api/abacatepay/webhook/route.ts src/app/api/abacatepay/orders/[orderId]/status/route.ts
git commit -m "feat(api): webhook AbacatePay e status do pedido"
```

---

## Task 14: Remover a Stripe (código + dependência)

**Files:**

- Remove: `src/lib/stripe.ts`, `src/lib/stripe-payment-methods.ts`
- Remove: `src/app/api/stripe/checkout/route.ts`, `src/app/api/stripe/webhook/route.ts`
- Remove: `src/lib/orders/insert-order.ts`, `src/lib/orders/utils.ts`, `src/lib/orders/utils.test.ts`
- Modify: `package.json` (remover `stripe`)

- [ ] **Step 1: Apagar os arquivos**

```bash
git rm src/lib/stripe.ts src/lib/stripe-payment-methods.ts \
  src/app/api/stripe/checkout/route.ts src/app/api/stripe/webhook/route.ts \
  src/lib/orders/insert-order.ts src/lib/orders/utils.ts src/lib/orders/utils.test.ts
# remover diretórios vazios, se houver
rmdir src/app/api/stripe/checkout src/app/api/stripe/webhook src/app/api/stripe 2>/dev/null || true
```

- [ ] **Step 2: Verificar que `formatDeliveryAddress` ainda vive em `@/components/order/utils`**

`formatDeliveryAddress` e `validateOrderCheckoutPayload` estão em `src/components/order/utils.ts` (NÃO no removido `src/lib/orders/utils.ts`). Confirmar com:

Run: `rg "export function formatDeliveryAddress" src/components/order/utils.ts`
Expected: 1 match

- [ ] **Step 3: Remover a dependência `stripe`**

Run: `pnpm remove stripe`
Expected: `stripe` sai de `package.json` e do lockfile

- [ ] **Step 4: Garantir que nada importa mais a Stripe**

Run: `rg -i "stripe" src/`
Expected: nenhum match em `src/` (referências só em docs)

- [ ] **Step 5: Typecheck + testes**

Run: `pnpm typecheck && pnpm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(checkout): remover integração Stripe"
```

---

## Task 15: UI — escolha de pagamento + tela Pix

**Files:**

- Create: `src/components/order/OrderCheckoutModal/components/PaymentMethodChoice/index.tsx`
- Create: `src/components/order/OrderCheckoutModal/components/PaymentMethodChoice/types.ts`
- Create: `src/components/order/OrderCheckoutModal/components/PaymentMethodChoice/constants.ts`
- Create: `src/components/order/OrderCheckoutModal/components/OrderPixPayment/index.tsx`
- Create: `src/components/order/OrderCheckoutModal/components/OrderPixPayment/types.ts`
- Modify: `src/components/order/types.ts`
- Modify: `src/components/order/OrderCheckoutModal/components/OrderForm/index.tsx`
- Modify: `src/components/order/OrderCheckoutModal/components/OrderForm/types.ts`

- [ ] **Step 1: Adicionar `OrderPaymentMethod` aos tipos de order**

Acrescentar ao final de `src/components/order/types.ts`:

```ts
export type OrderPaymentMethod = "pix" | "card";
```

- [ ] **Step 2: `PaymentMethodChoice/types.ts`**

```ts
import type { OrderPaymentMethod } from "@/components/order/types";

export type PaymentMethodChoiceProps = {
  value: OrderPaymentMethod;
  onChange: (method: OrderPaymentMethod) => void;
  disabled?: boolean;
};
```

- [ ] **Step 3a: `PaymentMethodChoice/constants.ts`** (dados estáticos fora do `index.tsx`, exigência do `check:folders`)

```ts
import type { OrderPaymentMethod } from "@/components/order/types";

export const PAYMENT_METHOD_OPTIONS: {
  id: OrderPaymentMethod;
  label: string;
  hint: string;
}[] = [
  { id: "pix", label: "Pix", hint: "Na hora, sem sair do site" },
  { id: "card", label: "Cartão de crédito", hint: "Parcelamento disponível" },
];
```

- [ ] **Step 3b: `PaymentMethodChoice/index.tsx`**

```tsx
"use client";

import { cn } from "@/lib/utils";

import { PAYMENT_METHOD_OPTIONS } from "./constants";
import type { PaymentMethodChoiceProps } from "./types";

export function PaymentMethodChoice({
  value,
  onChange,
  disabled,
}: PaymentMethodChoiceProps) {
  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="text-black-1 text-sm font-medium">
        Forma de pagamento
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {PAYMENT_METHOD_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={value === option.id}
            className={cn(
              "flex flex-col gap-0.5 rounded-xl border px-4 py-3 text-left transition-colors",
              value === option.id
                ? "border-primary bg-primary/5"
                : "border-input hover:border-primary/50",
            )}
          >
            <span className="text-black-1 text-sm font-semibold">
              {option.label}
            </span>
            <span className="text-xs text-gray-500">{option.hint}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 4: `OrderPixPayment/types.ts`**

```ts
export type OrderPixPaymentProps = {
  orderId: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string | null;
  onConfirmed: () => void;
};
```

- [ ] **Step 5: `OrderPixPayment/index.tsx`** (QR + copiar + polling)

```tsx
"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import type { OrderPixPaymentProps } from "./types";

export function OrderPixPayment({
  orderId,
  brCode,
  brCodeBase64,
  expiresAt,
  onConfirmed,
}: OrderPixPaymentProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/abacatepay/orders/${orderId}/status`,
        );
        if (!response.ok) return;
        const data = (await response.json()) as { status?: string };
        if (active && data.status === "paid") {
          clearInterval(interval);
          onConfirmed();
        }
      } catch {
        // silencioso — segue tentando até expirar/desmontar
      }
    }, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderId, onConfirmed]);

  async function handleCopy() {
    await navigator.clipboard.writeText(brCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-sm text-gray-600">
        Escaneie o QR Code ou copie o código Pix para pagar.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brCodeBase64}
        alt="QR Code Pix"
        className="border-input h-56 w-56 rounded-lg border"
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleCopy}
      >
        {copied ? "Código copiado!" : "Copiar código Pix"}
      </Button>
      {expiresAt ? (
        <p className="text-xs text-gray-500">
          Expira em {new Date(expiresAt).toLocaleTimeString("pt-BR")}
        </p>
      ) : null}
      <p className="text-primary text-sm" role="status">
        Aguardando confirmação do pagamento…
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Props do `OrderForm`**

Substituir `src/components/order/OrderCheckoutModal/components/OrderForm/types.ts`:

```ts
export type OrderFormProps = {
  productId: string;
  planId: string;
  onPaid: (orderId: string) => void;
};
```

- [ ] **Step 7: Reescrever `OrderForm/index.tsx`** (seleção de pagamento + Pix/redirect)

Substituir o componente para: gerenciar `paymentMethod`, postar para `/api/abacatepay/orders`, exibir Pix inline ou redirecionar no cartão. Manter todos os campos do formulário já existentes (nome, e-mail, telefone, CEP, endereço, número, complemento, bairro, cidade, observações).

```tsx
"use client";

import { useState } from "react";

import type {
  OrderFormFieldValues,
  OrderPaymentMethod,
} from "@/components/order/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Field } from "./components/Field";
import { ORDER_FORM_DEFAULT_VALUES } from "./constants";
import type { OrderFormProps } from "./types";
import { OrderPixPayment } from "../OrderPixPayment";
import { PaymentMethodChoice } from "../PaymentMethodChoice";

type PixState = {
  orderId: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string | null;
};

type OrdersApiResponse =
  | {
      method: "pix";
      orderId: string;
      brCode: string;
      brCodeBase64: string;
      expiresAt: string | null;
    }
  | { method: "card"; orderId: string; url: string }
  | { error: string };

export function OrderForm({ productId, planId, onPaid }: OrderFormProps) {
  const [values, setValues] = useState<OrderFormFieldValues>(
    ORDER_FORM_DEFAULT_VALUES,
  );
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>("pix");
  const [pix, setPix] = useState<PixState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof OrderFormFieldValues>(
    key: K,
    value: OrderFormFieldValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/abacatepay/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, planId, paymentMethod, ...values }),
      });

      const data = (await response.json()) as OrdersApiResponse;

      if (!response.ok || "error" in data) {
        setError(
          ("error" in data && data.error) ||
            "Não foi possível iniciar o pagamento.",
        );
        return;
      }

      if (data.method === "card") {
        window.location.href = data.url;
        return;
      }

      setPix({
        orderId: data.orderId,
        brCode: data.brCode,
        brCodeBase64: data.brCodeBase64,
        expiresAt: data.expiresAt,
      });
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (pix) {
    return (
      <OrderPixPayment
        orderId={pix.orderId}
        brCode={pix.brCode}
        brCodeBase64={pix.brCodeBase64}
        expiresAt={pix.expiresAt}
        onConfirmed={() => onPaid(pix.orderId)}
      />
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-3">
        <Field id="order-name" label="Nome completo" required>
          <Input
            id="order-name"
            name="name"
            autoComplete="name"
            required
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="order-email" label="E-mail" required>
            <Input
              id="order-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </Field>

          <Field id="order-phone" label="Telefone" required>
            <Input
              id="order-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              placeholder="(62) 99999-9999"
              value={values.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </Field>
        </div>

        <Field id="order-postal-code" label="CEP" required>
          <Input
            id="order-postal-code"
            name="postalCode"
            autoComplete="postal-code"
            required
            placeholder="74000-000"
            value={values.postalCode}
            onChange={(event) => updateField("postalCode", event.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <Field id="order-street" label="Endereço" required>
            <Input
              id="order-street"
              name="street"
              autoComplete="street-address"
              required
              value={values.street}
              onChange={(event) => updateField("street", event.target.value)}
            />
          </Field>

          <Field id="order-number" label="Número" required>
            <Input
              id="order-number"
              name="number"
              required
              className="sm:w-28"
              value={values.number}
              onChange={(event) => updateField("number", event.target.value)}
            />
          </Field>
        </div>

        <Field id="order-complement" label="Complemento">
          <Input
            id="order-complement"
            name="complement"
            autoComplete="address-line2"
            value={values.complement}
            onChange={(event) => updateField("complement", event.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="order-neighborhood" label="Bairro" required>
            <Input
              id="order-neighborhood"
              name="neighborhood"
              required
              value={values.neighborhood}
              onChange={(event) =>
                updateField("neighborhood", event.target.value)
              }
            />
          </Field>

          <Field id="order-city" label="Cidade" required>
            <Input
              id="order-city"
              name="city"
              autoComplete="address-level2"
              required
              value={values.city}
              onChange={(event) => updateField("city", event.target.value)}
            />
          </Field>
        </div>

        <Field id="order-notes" label="Observações">
          <textarea
            id="order-notes"
            name="notes"
            rows={3}
            value={values.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            className={cn(
              "border-input bg-input-background text-black-1 focus-visible:ring-ring w-full rounded-lg border px-3 py-2 text-sm transition-colors placeholder:text-gray-500 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            )}
            placeholder="Horário preferencial, referência do local, etc."
          />
        </Field>
      </div>

      <PaymentMethodChoice
        value={paymentMethod}
        onChange={setPaymentMethod}
        disabled={isSubmitting}
      />

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting
          ? "Processando..."
          : paymentMethod === "pix"
            ? "Pagar com Pix"
            : "Pagar com cartão"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 8: Typecheck**

Run: `pnpm typecheck`
Expected: FAIL em `OrderCheckoutModal/index.tsx` — `OrderForm` agora exige `onPaid`. Corrigido na Task 16.

- [ ] **Step 9: Commit**

```bash
git add src/components/order/types.ts src/components/order/OrderCheckoutModal/components/PaymentMethodChoice src/components/order/OrderCheckoutModal/components/OrderPixPayment src/components/order/OrderCheckoutModal/components/OrderForm
git commit -m "feat(order): escolha Pix/cartão e tela de pagamento Pix no modal"
```

---

## Task 16: Ligar `onPaid` no modal + success genérico

**Files:**

- Modify: `src/components/order/OrderCheckoutModal/index.tsx`
- Modify: `src/components/checkout/CheckoutSuccessPage/index.tsx`

- [ ] **Step 1: Passar `onPaid` do modal para o `OrderForm`**

Em `OrderCheckoutModal/index.tsx`, redirecionar para a página de sucesso quando o Pix confirmar. Usar `useRouter` (componente vira client). Substituir o componente:

```tsx
"use client";

import { useRouter } from "next/navigation";

import {
  findPricingPlanLabel,
  findPricingPlanPrice,
  findPricingProduct,
} from "@/components/pricing/utils";
import { ROUTES } from "@/lib/routes";
import { formatBRL } from "@/lib/utils";

import { OrderActions } from "./components/OrderActions";
import { OrderForm } from "./components/OrderForm";
import type { OrderCheckoutModalProps } from "./types";

export function OrderCheckoutModal({
  productId,
  planId,
  onClose,
}: OrderCheckoutModalProps) {
  const router = useRouter();
  const product = findPricingProduct(productId);
  const planLabel = findPricingPlanLabel(productId, planId);
  const priceCents = findPricingPlanPrice(productId, planId);

  if (!product || !planLabel || priceCents === undefined) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-primary truncate text-sm font-semibold">
            {product.name}
          </p>
          <p className="truncate text-sm text-gray-500">{planLabel}</p>
        </div>
        <p className="text-primary shrink-0 text-base font-bold">
          {formatBRL(priceCents)}
        </p>
      </div>

      <OrderForm
        productId={productId}
        planId={planId}
        onPaid={(orderId) =>
          router.push(`${ROUTES.checkoutSuccess}?orderId=${orderId}`)
        }
      />

      <OrderActions onClose={onClose} />
    </div>
  );
}
```

- [ ] **Step 2: Copy genérica no success (sem `session_id`)**

`CheckoutSuccessPage` já não depende de `session_id` (texto estático). Confirmar/ajustar o texto para servir Pix e cartão:

```tsx
import { CheckoutResultLayout } from "@/components/checkout/components/CheckoutResultLayout";

import { CheckoutSuccessActions } from "./components/CheckoutSuccessActions";

export function CheckoutSuccessPage() {
  return (
    <CheckoutResultLayout
      title="Pagamento recebido"
      description="Obrigado pelo seu pedido! Assim que o pagamento for confirmado, nossa equipe entrará em contato para combinar a entrega."
      actions={<CheckoutSuccessActions />}
    />
  );
}
```

- [ ] **Step 3: Typecheck + testes + lint de pastas**

Run: `pnpm typecheck && pnpm test && pnpm check:folders`
Expected: PASS. O teste `PricingPage.test.tsx` continua válido (mocka `next/navigation` com `useRouter` retornando `replace`; adicionar `push: vi.fn()` ao mock se o teste reclamar de `push` indefinido — ver Step 4).

- [ ] **Step 4: Se o teste do modal quebrar por `useRouter().push`**

Em `src/components/pricing/PricingPage/PricingPage.test.tsx`, ampliar o mock:

```ts
const replace = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
    push,
  }),
}));
```

Run: `pnpm test src/components/pricing/PricingPage/PricingPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/order/OrderCheckoutModal/index.tsx src/components/checkout/CheckoutSuccessPage/index.tsx src/components/pricing/PricingPage/PricingPage.test.tsx
git commit -m "feat(order): redirecionar para sucesso ao confirmar Pix"
```

---

## Task 17: Migração Supabase

**Files:**

- Create: `supabase/migrations/20260528120000_orders_abacatepay.sql`

- [ ] **Step 1: Escrever a migração**

```sql
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
```

- [ ] **Step 2: Aplicar no Supabase**

Rodar o SQL no painel do projeto (dev/prod). Verificação manual:

Run (no SQL Editor): `select column_name from information_schema.columns where table_name = 'orders';`
Expected: contém `payment_provider`, `payment_method`, `payment_id`, `status`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260528120000_orders_abacatepay.sql
git commit -m "feat(db): migração orders para AbacatePay (pending + provedor)"
```

---

## Task 18: Env, README e docs de deploy

**Files:**

- Modify: `.env.example`
- Modify: `README.md`
- Modify: `docs/deploy-producao.md`

- [ ] **Step 1: Atualizar `.env.example`**

Remover o bloco Stripe e adicionar AbacatePay (manter Site, contato, Supabase, Trello):

```env
# --- AbacatePay (Pix transparente + cartão hospedado) ------------------------
# Chave de API (dev ou produção — o ambiente é definido pela chave).
ABACATEPAY_API_KEY=
# Secret do webhook (vai na query string ?webhookSecret=...).
ABACATEPAY_WEBHOOK_SECRET=
# Opcional: sobrescrever a chave pública HMAC (default: constante da doc Abacate).
# ABACATEPAY_WEBHOOK_HMAC_KEY=
```

Remover as linhas:

- `STRIPE_SECRET_KEY=`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=`
- `STRIPE_PAYMENT_METHODS=card`
- `STRIPE_WEBHOOK_SECRET=` (ambos os blocos local/produção) e os comentários `stripe listen`.

- [ ] **Step 2: Atualizar `README.md` e `docs/deploy-producao.md`**

Substituir menções a Stripe/`stripe listen`/Checkout Session pelo fluxo AbacatePay:

- Pagamento online: Pix (transparente) + cartão (checkout hospedado) via AbacatePay.
- Webhook de produção: `https://locafull.vercel.app/api/abacatepay/webhook?webhookSecret=...`.
- Webhook local: usar tunnel (ngrok/cloudflare) apontando para `/api/abacatepay/webhook?webhookSecret=...` ou simular pagamento Pix no dev mode da Abacate.
- Variáveis na Vercel: `ABACATEPAY_API_KEY`, `ABACATEPAY_WEBHOOK_SECRET` (remover `STRIPE_*`).

Run após editar: `rg -i "stripe" README.md docs/deploy-producao.md .env.example`
Expected: nenhum match

- [ ] **Step 3: Commit**

```bash
git add .env.example README.md docs/deploy-producao.md
git commit -m "docs(checkout): env e deploy para AbacatePay; remover Stripe"
```

---

## Task 19: Verificação final

- [ ] **Step 1: Suite completa**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
Expected: tudo PASS. Sem referências a `stripe` em `src/`.

- [ ] **Step 2: Checklist manual de go-live (não-código)**

- [ ] Conta AbacatePay verificada (dev + produção)
- [ ] Produtos criados na Abacate; `abacateProductId` reais no `constants.ts`
- [ ] `ABACATEPAY_API_KEY` e `ABACATEPAY_WEBHOOK_SECRET` na Vercel
- [ ] Webhook de produção cadastrado na Abacate com a URL + secret
- [ ] Migração SQL aplicada em produção
- [ ] Teste Pix (simulate no dev) → status vira `paid` → card no Trello
- [ ] Teste cartão (cartão de teste) → redirect → webhook → success
- [ ] Webhook Stripe desativado no dashboard Stripe

- [ ] **Step 3: Commit (se houver ajustes finais de lint/format)**

```bash
git add -A
git commit -m "chore(checkout): ajustes finais da migração AbacatePay"
```

---

## Notas de execução

- **Ordem dos commits e typecheck:** as Tasks 6–13 deixam o typecheck "vermelho" por causa dos arquivos Stripe legados (`insert-order.ts`, `utils.ts`) que ainda importam `Stripe` e `stripe_session_id`. Isso é resolvido na Task 14 (remoção). Se preferir manter o typecheck verde a cada passo, execute a Task 14 logo após a Task 11.
- **`formatDeliveryAddress`/`validateOrderCheckoutPayload`:** vivem em `src/components/order/utils.ts` (mantido), não no `src/lib/orders/utils.ts` (removido).
- **Polling Pix:** confia no webhook como fonte de verdade; o polling de `/status` só melhora a UX. Sem webhook configurado, o Pix não confirma sozinho.
- **CPF no cartão:** se, em testes, a Abacate exigir `taxId`/CPF no checkout de cartão, adicionar campo CPF ao formulário e enviar em `customer` — fora do escopo até confirmar empiricamente (ver spec §16).
- **Pix expirado:** v1 não regenera QR automaticamente. Se o Pix expirar, o cliente fecha e refaz o pedido (novo pending). "Gerar novo Pix" (spec §13) fica como melhoria futura.
- **`OrderPaymentMethod` duplicado:** o tipo `"pix" | "card"` existe em `src/lib/orders/types.ts` (back-end) e `src/components/order/types.ts` (front-end). São estruturalmente idênticos e compatíveis; mantidos separados para não acoplar componentes ao `lib/orders`. Não unificar sem necessidade.

```

```
