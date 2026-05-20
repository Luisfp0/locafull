# Locafull — Convenções de pastas (admin-checkout-front)

**Data:** 2026-05-19  
**Status:** Implementado  
**Escopo:** Organização de `components/`, `app/` fino, tipos `*Props`, constantes por feature

---

## Regra por pasta

```
ComponentName/
  index.tsx
  types.ts       # NomeDoComponenteProps
  constants.ts   # opcional — dados estáticos
  utils.ts       # opcional — funções puras locais
  components/    # subcomponentes (mesma estrutura)
```

- Props: `HeroProps`, `ProductPricingCardProps` — **sem** prefixo `I` obrigatório.
- `app/`: metadata + import; sem UI/helpers inline.
- Feature (`pricing`, `order`, `home/WhatWeDo`): `types.ts`, `constants.ts`, `utils.ts` na raiz da feature quando compartilhado.
- Global: `lib/routes.ts`, `lib/constants.ts` (site, nav, contato).

## Implementado

- `components/pricing/` — types, constants, utils; subpastas ProductCombos, ProductCta, PricingPageFooter.
- `components/order/OrderPage/` — OrderSummaryRow, OrderActions.
- `components/home/WhatWeDo/` — constants, WhatWeDoCardImage.
- Removidos `lib/types.ts`, `lib/pricing-catalog.ts`.
- Testes: `PricingPage.test.tsx`, `WhatWeDo.test.tsx` colados ao componente.
- Enforcement: `pnpm check:folders` (pre-commit + `pnpm lint`); regra Cursor em `.cursor/rules/component-folders.mdc`.
