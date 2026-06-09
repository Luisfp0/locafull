# Delivery Scheduling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar seleção de data de entrega no checkout, com vagas calculadas (Trello ENTREGAR + pending Supabase), reserva em pending e card na coluna ENTREGAR do dia após pagamento.

**Architecture:** Módulo `lib/scheduling/` para datas e vagas; `lib/trello/` estendido para listar/criar colunas ENTREGAR; API `GET /api/availability/delivery-dates`; campo no `OrderForm`; `scheduled_date` em orders; revalidação no POST de pedido; `createTrelloCardForOrder` usa listId da data.

**Tech Stack:** Next.js App Router, Supabase, Trello REST API, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-03-delivery-scheduling-design.md`

---

## File map

| File                                                            | Responsibility                                 |
| --------------------------------------------------------------- | ---------------------------------------------- |
| `src/lib/scheduling/constants.ts`                               | Limite, horizonte, dias da semana              |
| `src/lib/scheduling/dates.ts`                                   | Gerar datas candidatas seg–sáb                 |
| `src/lib/scheduling/list-name.ts`                               | Formato/parse `ENTREGAR - TERÇA-FEIRA - 09/06` |
| `src/lib/scheduling/availability.ts`                            | Calcular vagas por data                        |
| `src/lib/trello/client.ts`                                      | Fetch Trello (lists, cards, create list)       |
| `src/lib/trello/find-or-create-entregar-list.ts`                | Resolver listId por data                       |
| `src/lib/trello/config.ts`                                      | + `boardId`, `maxDeliveriesPerDay`             |
| `src/app/api/availability/delivery-dates/route.ts`              | GET disponibilidade                            |
| `src/lib/orders/count-pending-by-date.ts`                       | Query Supabase pending por data                |
| `src/components/order/types.ts`                                 | + `scheduledDate`                              |
| `src/components/order/utils.ts`                                 | Validar scheduledDate                          |
| `src/components/order/OrderCheckoutModal/components/OrderForm/` | Select de data + fetch                         |
| `supabase/migrations/20260603120000_orders_scheduled_date.sql`  | Coluna scheduled_date                          |

---

### Task 1: Scheduling — datas e nome de coluna

**Files:**

- Create: `src/lib/scheduling/constants.ts`
- Create: `src/lib/scheduling/dates.ts`
- Create: `src/lib/scheduling/list-name.ts`
- Create: `src/lib/scheduling/dates.test.ts`
- Create: `src/lib/scheduling/list-name.test.ts`

- [ ] **Step 1: Write failing tests**

`src/lib/scheduling/list-name.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { buildEntregarListName, parseEntregarListDate } from "./list-name";

describe("buildEntregarListName", () => {
  it("formats like board pattern", () => {
    const date = new Date(2026, 5, 9); // 09/06/2026 terça
    expect(buildEntregarListName(date)).toBe("ENTREGAR - TERÇA-FEIRA - 09/06");
  });
});

describe("parseEntregarListDate", () => {
  it("parses ENTREGAR list title", () => {
    expect(parseEntregarListDate("ENTREGAR - TERÇA-FEIRA - 09/06", 2026)).toBe(
      "2026-06-09",
    );
  });

  it("ignores RETIRAR lists", () => {
    expect(parseEntregarListDate("RETIRAR - TERÇA-FEIRA - 09/06", 2026)).toBe(
      null,
    );
  });
});
```

`src/lib/scheduling/dates.test.ts`:

```typescript
import { describe, expect, it, vi } from "vitest";
import { getDeliveryCandidateDates } from "./dates";

describe("getDeliveryCandidateDates", () => {
  it("excludes today and sundays, returns 30-day horizon", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 7, 12)); // domingo 07/06/2026

    const dates = getDeliveryCandidateDates();

    expect(dates[0]).toBe("2026-06-08"); // segunda
    expect(dates).not.toContain("2026-06-07");
    expect(dates).not.toContain("2026-06-14"); // domingo
    expect(dates.length).toBeGreaterThan(0);

    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm test src/lib/scheduling/list-name.test.ts src/lib/scheduling/dates.test.ts`

- [ ] **Step 3: Implement**

`constants.ts`: `MAX_DELIVERIES_PER_DAY = 6`, `HORIZON_DAYS = 30`, `MIN_ADVANCE_DAYS = 1`.

`dates.ts`: iterar de amanhã até +30 dias; filtrar `getDay() !== 0`; retornar `YYYY-MM-DD[]`.

`list-name.ts`: `WEEKDAY_PT` array; `buildEntregarListName(date)`; `parseEntregarListDate(name, year)` com regex `/^ENTREGAR\s*-\s*(\S+)\s*-\s*(\d{2})\/(\d{2})$/`.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/scheduling/
git commit -m "feat(scheduling): utilitários de datas e nome de coluna ENTREGAR"
```

---

### Task 2: Scheduling — cálculo de vagas

**Files:**

- Create: `src/lib/scheduling/availability.ts`
- Create: `src/lib/scheduling/availability.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, expect, it } from "vitest";
import { computeSlotsRemaining } from "./availability";

describe("computeSlotsRemaining", () => {
  it("subtracts trello cards and pending orders from max", () => {
    expect(
      computeSlotsRemaining({ trelloCards: 3, pendingOrders: 2, max: 6 }),
    ).toBe(1);
  });

  it("never goes below zero", () => {
    expect(
      computeSlotsRemaining({ trelloCards: 5, pendingOrders: 3, max: 6 }),
    ).toBe(0);
  });
});
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement `computeSlotsRemaining` e `buildAvailabilityForDates`** que recebe mapa `date → { trelloCards, pendingOrders }` e retorna `{ date, label, slotsRemaining }[]` só com `slotsRemaining > 0`.

Label: `Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })` capitalizado.

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(scheduling): cálculo de vagas por data"
```

---

### Task 3: Trello client + findOrCreateEntregarList

**Files:**

- Create: `src/lib/trello/client.ts`
- Modify: `src/lib/trello/config.ts`
- Modify: `src/lib/trello/types.ts`
- Create: `src/lib/trello/find-or-create-entregar-list.ts`
- Create: `src/lib/trello/find-or-create-entregar-list.test.ts`
- Modify: `.env.example`

- [ ] **Step 1: Extend config**

```typescript
export type TrelloConfig = {
  apiKey: string;
  token: string;
  boardId: string;
  labelIdEntregar: string;
  maxDeliveriesPerDay: number;
  listIdFallback?: string; // ex-TRELLO_LIST_ID_A_AGENDAR
};
```

Env: `TRELLO_BOARD_ID`, `TRELLO_MAX_DELIVERIES_PER_DAY=6`, manter `TRELLO_LIST_ID_A_AGENDAR` como fallback opcional.

- [ ] **Step 2: `client.ts`** — `fetchTrelloLists(boardId)`, `createTrelloList(boardId, name)`, `countOpenCardsInList(listId)`.

- [ ] **Step 3: Test findOrCreateEntregarList** com `vi.stubGlobal("fetch", …)`:
  - Retorna listId existente quando nome bate.
  - Cria lista quando não existe.

- [ ] **Step 4: Implement `findOrCreateEntregarList(date: string): Promise<{ listId } | { error }>`**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(trello): client e findOrCreateEntregarList"
```

---

### Task 4: Supabase migration + count pending

**Files:**

- Create: `supabase/migrations/20260603120000_orders_scheduled_date.sql`
- Modify: `src/lib/orders/types.ts`
- Create: `src/lib/orders/count-pending-by-date.ts`

- [ ] **Step 1: Migration**

```sql
alter table public.orders
  add column if not exists scheduled_date date;

create index if not exists orders_scheduled_date_status_idx
  on public.orders (scheduled_date, status)
  where status = 'pending';
```

Pedidos antigos: `scheduled_date` nullable; novos pedidos exigem valor na validação.

- [ ] **Step 2: Add `scheduled_date: string | null` to `OrderInsertRow`**

- [ ] **Step 3: `countPendingOrdersByDates(dates: string[])`** — query Supabase `status = 'pending'` group by scheduled_date; retorna `Record<string, number>`.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(orders): coluna scheduled_date e contagem de pending"
```

---

### Task 5: API GET /api/availability/delivery-dates

**Files:**

- Create: `src/app/api/availability/delivery-dates/route.ts`

- [ ] **Step 1: Implement route**

1. `getDeliveryCandidateDates()`
2. `fetchTrelloLists` → mapa date → card count via `parseEntregarListDate`
3. `countPendingOrdersByDates`
4. `buildAvailabilityForDates`
5. JSON `{ dates }`
6. Cache simples: variável module-level `{ cachedAt, payload }` TTL 5 min

- [ ] **Step 2: Manual test**

Run dev: `curl http://localhost:3000/api/availability/delivery-dates`

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(api): rota de datas de entrega disponíveis"
```

---

### Task 6: Validação e insert com scheduledDate

**Files:**

- Modify: `src/components/order/types.ts`
- Modify: `src/components/order/utils.ts`
- Modify: `src/lib/orders/insert-pending-order.ts`
- Modify: `src/app/api/abacatepay/orders/route.ts`
- Create: `src/lib/scheduling/validate-scheduled-date.ts`
- Modify: `src/components/order/utils.test.ts` (se existir)

- [ ] **Step 1: Add `scheduledDate: string` to `OrderCheckoutPayload`**

- [ ] **Step 2: `validateScheduledDate(date, availabilityCheck)`** — formato ISO date, seg–sáb, >= amanhã, dentro de 30 dias.

- [ ] **Step 3: No POST route**, antes de insert:
  - Recalcular vagas para a data escolhida (mesma lógica da API)
  - Se `slotsRemaining < 1` → 400

- [ ] **Step 4: `insertPendingOrder`** persiste `scheduled_date`

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(checkout): validar e reservar scheduledDate no pedido"
```

---

### Task 7: Trello card na coluna ENTREGAR + descrição

**Files:**

- Modify: `src/lib/trello/create-order-card.ts`
- Modify: `src/lib/trello/build-card.ts`
- Modify: `src/lib/trello/build-card.test.ts`

- [ ] **Step 1: Update test fixture** com `scheduled_date: "2026-06-09"`

- [ ] **Step 2: `buildTrelloCardFromOrder`** — adicionar linha `Data de entrega: …` na desc

- [ ] **Step 3: `createTrelloCardForOrder`**
  - Se `row.scheduled_date`: `findOrCreateEntregarList` → `idList`
  - Senão: fallback `listIdFallback` (comportamento legado)

- [ ] **Step 4: Run tests PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(trello): card na coluna ENTREGAR da data agendada"
```

---

### Task 8: UI — select de data no OrderForm

**Files:**

- Modify: `src/components/order/OrderCheckoutModal/components/OrderForm/index.tsx`
- Modify: `src/components/order/OrderCheckoutModal/components/OrderForm/constants.ts`
- Create: `src/components/order/OrderCheckoutModal/components/OrderForm/components/DeliveryDateField/index.tsx`
- Create: `src/components/order/OrderCheckoutModal/components/OrderForm/components/DeliveryDateField/types.ts`

- [ ] **Step 1: `DeliveryDateField`** — `useEffect` fetch `/api/availability/delivery-dates`; estados loading/error/empty; `<select required>`.

- [ ] **Step 2: Wire `scheduledDate` em values + submit body**

- [ ] **Step 3: Posicionar entre Observações e PaymentMethodChoice**

- [ ] **Step 4: Manual test no modal de pricing**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(ui): campo de data de entrega no checkout"
```

---

### Task 9: Docs e env

**Files:**

- Modify: `.env.example`
- Modify: `docs/deploy-producao.md`
- Modify: `supabase/README.md`

- [ ] **Step 1: Documentar novas env vars e migration**

- [ ] **Step 2: Commit**

```bash
git commit -m "docs: agendamento de entrega e env Trello board"
```

---

### Task 10: Verificação final

- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] Fluxo manual: abrir modal → ver datas → criar pedido Pix → simular webhook → card na coluna ENTREGAR correta no Trello

---

## Spec coverage checklist

| Spec §                  | Task       |
| ----------------------- | ---------- |
| Regras de negócio       | 1, 2, 6    |
| Cálculo híbrido         | 2, 4, 5, 6 |
| Criação coluna Trello   | 3, 7       |
| API availability        | 5          |
| scheduled_date Supabase | 4, 6       |
| UI select               | 8          |
| Env                     | 3, 9       |
| Erros                   | 5, 6, 8    |
