# Locafull — Modal de checkout em /pricing

**Data:** 2026-05-21  
**Status:** Aprovado  
**Escopo:** Formulário de pedido em modal flutuante na página de valores; URL com query; fechar com scroll ao card do equipamento.

---

## 1. Objetivo

Substituir o formulário inline no topo de `/pricing` por um **modal centralizado** sobre a lista de equipamentos. O usuário escolhe produto/plano, preenche dados, paga na Stripe — sem sair da página de valores até o redirect de pagamento.

Referência de UX: modais do **admin-checkout-front** (`ConfirmationModal`: overlay, painel central, título, X, slot de conteúdo, ações).

---

## 2. Decisões de produto

| Tema              | Decisão                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| URL ao abrir      | `/pricing?product={id}&plan={id}` — compartilhável; F5 reabre o modal         |
| Layout            | Modal **sempre centralizado**; scroll **dentro** do painel (`max-h` ~90vh)    |
| Fechar modal      | `replace("/pricing")` sem query + **scroll suave** até `#product-{productId}` |
| Fechar por        | X, clique no backdrop, tecla Escape                                           |
| Query inválida    | Apenas lista de preços; **sem** modal                                         |
| Hero “Peça agora” | `/pricing` sem query — sem modal                                              |

---

## 3. Fluxo

```
/pricing
  → CTA Solicitar / Escolher
  → /pricing?product=x&plan=y
  → modal abre (produto + plano válidos)
  → Pagar com cartão → POST /api/stripe/checkout → Stripe Checkout
  → /checkout/success | /checkout/cancel

Fechar (X | backdrop | Esc | Alterar seleção):
  → router.replace("/pricing")
  → scrollIntoView(#product-{productId})
```

**Inalterado:** `OrderForm`, validação, Stripe metadata, webhook, Supabase, `buildOrderHref`, redirect `/order` → `/pricing`.

---

## 4. Abordagem técnica

**Escolhida:** overlay próprio (padrão `MobileMenu`), sem nova dependência Radix/MUI.

**Descartada:** estado só React sem URL; Radix Dialog (desnecessário no MVP).

---

## 5. Componentes

### 5.1 `components/ui/Modal/`

Shell reutilizável:

- `open`, `onClose`, `title`, `children`, `ariaLabel` (opcional)
- Backdrop: `fixed inset-0 z-50`, `bg-overlay`, clique chama `onClose`
- Painel: centralizado (`translate`), `max-w-lg`, `rounded-2xl`, `bg-white`, `shadow-brand`, `max-h-[90vh]`, `overflow-y-auto`
- Cabeçalho: título + botão fechar (ícone X, `aria-label`)
- `useEffect`: listener `Escape` → `onClose` quando `open`
- Bloquear scroll do `body` quando aberto (`overflow-hidden` no documento)

### 5.2 `components/order/OrderCheckoutModal/`

Conteúdo do pedido (extrair de `OrderPage`):

- Props: `productId`, `planId`, `onClose`
- Resumo: `OrderSummaryRow` + `formatBRL`
- `OrderForm` (submit → Stripe, igual hoje)
- Ações:
  - Submit primário no form (“Pagar com cartão”)
  - “Alterar seleção” chama `onClose` (mesmo comportamento de fechar + scroll)

Retorna `null` se produto/plano inválidos (modal não deve abrir nesse caso).

### 5.3 `components/pricing/PricingPage/`

- Remover render inline de `OrderPage` no topo
- Cliente: `PricingPageClient` ou `"use client"` na orquestração conforme convenção do projeto
- Recebe `productId?`, `planId?` da rota
- `isOpen` = query válida (`findPricingProduct` + preço do plano)
- Renderiza `Modal` + `OrderCheckoutModal` quando `isOpen`
- `onClose`: `router.replace(ROUTES.pricing)` + `requestAnimationFrame` → `document.getElementById(\`product-${productId}\`)?.scrollIntoView({ behavior: "smooth", block: "start" })`

### 5.4 `ProductPricingCard`

- Adicionar `id={`product-${product.id}`}` no `<article>` (âncora para scroll ao fechar)

### 5.5 `OrderPage/`

- Deprecar uso na pricing; conteúdo migrado para `OrderCheckoutModal`
- Remover pasta `OrderPage` se não houver outros consumidores, ou manter re-export fino — implementação escolhe o mínimo (preferir remover e atualizar imports)

---

## 6. Rotas e URL

- `app/(marketing)/pricing/page.tsx`: continua lendo `searchParams`, passa para `PricingPage`
- CTAs: mantêm `buildOrderHref` → `/pricing?product=&plan=`
- Não adicionar query ao fechar modal

---

## 7. Acessibilidade

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` no título
- Foco inicial no modal ao abrir (primeiro focoável ou título)
- Escape fecha
- Backdrop não remove foco do painel de forma permanente (focus trap leve: opcional no MVP — pelo menos tabindex no painel)

---

## 8. Estilo (Tailwind / tokens Locafull)

- Espaçamento: `flex` + `gap` nos stacks do modal (sem `mt` entre irmãos)
- Padding do painel: `p-6 sm:p-8`
- Cores: `text-primary`, `border-border`, botões existentes (`Button`)

---

## 9. Erros e bordas

| Caso                                    | Comportamento                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `product` ou `plan` ausente na query    | Sem modal                                                                                |
| IDs inválidos                           | Sem modal                                                                                |
| Erro no checkout (form)                 | Mensagem no form; modal permanece aberto                                                 |
| Pagamento em andamento (`isSubmitting`) | Desabilitar fechar por backdrop (opcional) ou ignorar cliques no backdrop durante submit |

---

## 10. Testes

- `OrderCheckoutModal` ou util de validação: query válida → conteúdo renderizado
- `PricingPage`: com `productId`/`planId` válidos, modal no documento (Testing Library)
- `onClose` chama `replace` (mock `useRouter`)
- `ProductPricingCard` possui `id` esperado

---

## 11. Fora do escopo

- Radix Dialog / MUI Modal
- Alterar fluxo Stripe ou webhook
- Modal para barril (WhatsApp only)
- Histórico de pedidos no modal

---

## 12. Critérios de aceite

1. Em `/pricing`, lista sempre visível; modal só com query válida.
2. CTA abre modal via URL com `product` e `plan`.
3. Link `/pricing?product=mini-dumpster&plan=48h` abre modal direto (F5 ok).
4. Fechar limpa URL e rola até o card do equipamento.
5. Pagamento Stripe funciona como antes.
6. `pnpm lint`, `pnpm typecheck`, `pnpm test` passam.
