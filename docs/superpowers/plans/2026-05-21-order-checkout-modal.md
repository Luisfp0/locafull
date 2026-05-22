# Modal de checkout em /pricing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir o formulário de pedido em um modal centralizado sobre `/pricing`, controlado por `?product=&plan=`, fechando com URL limpa e scroll ao card do equipamento.

**Architecture:** Shell `Modal` em `components/ui` (padrão overlay do `MobileMenu`). Conteúdo em `OrderCheckoutModal` (migração de `OrderPage`). `PricingPage` client-side orquestra abertura via query válida e `onClose` com `router.replace` + `scrollIntoView`.

**Tech Stack:** Next.js App Router, React 19, Tailwind v4, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-05-21-order-checkout-modal-design.md`

---

## File map

| File                                                  | Ação                          |
| ----------------------------------------------------- | ----------------------------- |
| `components/ui/Modal/`                                | Criar                         |
| `components/order/OrderCheckoutModal/`                | Criar (conteúdo ex-OrderPage) |
| `components/pricing/PricingPage/`                     | Modificar (modal + client)    |
| `components/pricing/ProductPricingCard/index.tsx`     | Modificar (`id` no article)   |
| `components/order/OrderPage/`                         | Remover após migração         |
| `components/order/OrderPage/components/OrderActions/` | Mover ou adaptar em modal     |

---

### Task 1: Modal shell

**Files:**

- Create: `src/components/ui/Modal/index.tsx`, `types.ts`
- Test: `src/components/ui/Modal/Modal.test.tsx` (opcional mínimo: render + Escape)

- [ ] **Step 1:** Criar `Modal` com `open`, `onClose`, `title`, `children`
- [ ] **Step 2:** Backdrop + painel centralizado, `max-h-[90vh] overflow-y-auto`, `z-50`
- [ ] **Step 3:** Escape + `body overflow-hidden` quando aberto
- [ ] **Step 4:** Teste RTL: aberto renderiza título; Escape chama `onClose`
- [ ] **Step 5:** `pnpm test` + `pnpm check:folders`

---

### Task 2: OrderCheckoutModal

**Files:**

- Create: `src/components/order/OrderCheckoutModal/index.tsx`, `types.ts`
- Reuse: `OrderForm`, `OrderSummaryRow` de `OrderPage/components/`

- [ ] **Step 1:** Copiar lógica de resumo/validação de `OrderPage/index.tsx`
- [ ] **Step 2:** Props `productId`, `planId`, `onClose`; botão “Alterar seleção” → `onClose`
- [ ] **Step 3:** Envolver em estrutura para `Modal` (sem SiteShell)
- [ ] **Step 4:** Teste: props válidas renderizam resumo + form

---

### Task 3: PricingPage orquestração

**Files:**

- Create: `src/components/pricing/PricingPage/components/PricingPageClient/index.tsx` (se `page.tsx` permanecer server)
- Modify: `src/components/pricing/PricingPage/index.tsx`
- Modify: `src/components/pricing/types.ts` (se necessário)

- [ ] **Step 1:** Remover `<OrderPage />` inline do topo
- [ ] **Step 2:** Client wrapper: `isOpen` = produto + plano válidos
- [ ] **Step 3:** `<Modal open={isOpen} onClose={handleClose}>` + `<OrderCheckoutModal />`
- [ ] **Step 4:** `handleClose`: `router.replace(ROUTES.pricing)` + scroll `#product-${id}`
- [ ] **Step 5:** Teste: query válida → dialog/modal no DOM

---

### Task 4: Âncora nos cards

**Files:**

- Modify: `src/components/pricing/ProductPricingCard/index.tsx`

- [ ] **Step 1:** `id={\`product-${product.id}\`}`no`<article>`
- [ ] **Step 2:** Verificar scroll manual em dev

---

### Task 5: Limpeza OrderPage

**Files:**

- Delete: `src/components/order/OrderPage/index.tsx` (e types se órfão)
- Update: imports remanescentes

- [ ] **Step 1:** Grep `OrderPage` — zerar referências
- [ ] **Step 2:** Manter `OrderForm` / `OrderActions` em `OrderPage/components/` ou mover para `OrderCheckoutModal/components/` conforme `check:folders`
- [ ] **Step 3:** `pnpm lint` + `pnpm typecheck`

---

### Task 6: Verificação manual

- [ ] `/pricing` — sem modal
- [ ] CTA → URL com query → modal
- [ ] F5 com query → modal
- [ ] Fechar → URL limpa + scroll ao card
- [ ] Pagamento teste Stripe
- [ ] Mobile: modal centralizado com scroll interno

---

## Comandos

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm check:folders
pnpm dev
```
