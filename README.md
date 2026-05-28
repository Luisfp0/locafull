# Locafull

Landing e base do produto Locafull — locação de mini caçambas em Goiânia e região.

## Stack

- Next.js (App Router) + TypeScript
- pnpm
- Tailwind CSS v4 + shadcn-style components
- Vitest + Testing Library

## Scripts

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm start
pnpm lint
pnpm format       # Prettier
pnpm typecheck
pnpm test
```

## Estrutura

```
src/
  app/                 # Rotas (só metadata + import do componente)
  components/
    ui/                # Button, Input (shadcn)
    layout/            # Header, Footer, SiteShell, …
    home/              # Hero, WhatWeDo, ContactStrip
    pricing/           # types, constants, utils + páginas da feature
    order/             # OrderPage
    icons/
  lib/
    routes.ts          # ROUTES
    constants.ts       # site, nav, contato (global)
    utils.ts
  styles/
    tokens.css
    globals.css
```

**Pasta de componente** (padrão admin-checkout-front):

```
ComponentName/
  index.tsx
  types.ts             # NomeDoComponenteProps
  constants.ts         # dados estáticos só deste componente (opcional)
  utils.ts             # funções só deste componente (opcional)
  components/          # subcomponentes (mesma estrutura)
```

Tipos de domínio da feature ficam em `components/<feature>/types.ts` (ex.: `pricing/types.ts`).

## Tokens de design

Todas as cores e tamanhos ficam em `src/styles/tokens.css` (`--primary`, `--alert-2`, `--gray-100`, etc.).  
Valores da marca Locafull; nomes alinhados ao `global.css` do admin.

Para alterar WhatsApp, menu ou textos: `src/lib/constants.ts`.

## Pagamentos

Checkout online via **AbacatePay**:

- **Pix** — checkout transparente, QR Code exibido em modal no próprio site.
- **Cartão** — checkout hospedado pela AbacatePay.

O pedido é criado como `pending` e confirmado pelo webhook (`/api/abacatepay/webhook?webhookSecret=...`).

## Variáveis de ambiente

Copie `.env.example` para `.env.local` (desenvolvimento).

**Produção (Vercel):** checklist completo em [`docs/deploy-producao.md`](docs/deploy-producao.md).

## Husky

Pre-commit roda ESLint + Prettier nos arquivos staged (`lint-staged`).

## Rotas

| Rota                                    | Status                                 |
| --------------------------------------- | -------------------------------------- |
| `/`                                     | Landing                                |
| `/pricing`                              | Valores + checkout (`?product=&plan=`) |
| `/checkout/success`, `/checkout/cancel` | Pós-pagamento AbacatePay               |
| `/order`                                | Redireciona para `/pricing`            |

## Spec

Ver `docs/superpowers/specs/2026-05-16-locafull-landing-design.md`.
