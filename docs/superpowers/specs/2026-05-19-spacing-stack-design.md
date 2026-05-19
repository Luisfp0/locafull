# Locafull — Espaçamento: Stack, flex/gap e padding

**Data:** 2026-05-19  
**Status:** Aprovado para implementação  
**Escopo:** Componente `Stack`, refactor de margens em `src/`, regra em `AGENTS.md` — **mesmo visual** (mesmos pixels nos breakpoints atuais)

---

## 1. Objetivo

Padronizar espaçamento no frontend Locafull:

- **Prioridade:** `flex` + `gap` (via componente `Stack`) entre elementos irmãos no mesmo grupo de layout
- **Padding** onde a convenção exige inset (página, card, área clicável)
- **Margin** só em exceções documentadas (`mx-auto`, empurrar no flex, overlap negativo)

Eliminar o padrão atual de empilhar blocos com `mt-*` e `space-y-*` em filhos, sem alterar o layout percebido.

**Fora do escopo:**

- Componente `Container` (`mx-auto max-w-7xl px-4` repetido)
- ESLint custom banindo `mt-*`
- Mudança de tokens/cores/tipografia
- Páginas que ainda não existem no `src/`

---

## 2. Regras de espaçamento

| Mecanismo                                  | Quando usar                                                                                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Padding** (`p-*`, `px-*`, `py-*`)        | Inset de seção/página, interior de card ou borda, padding de controles (`Button`, `Input`)                                                          |
| **Flex + gap** (`Stack` ou `grid` + `gap`) | Distância entre irmãos no mesmo grupo (título → texto → CTA, itens de lista vertical, colunas de grid)                                              |
| **Margin**                                 | `mx-auto` para centralizar container; `ml-auto` / `mr-auto` para alinhar no flex; margem negativa pontual com comentário (ex.: overlap em `/order`) |

**Não usar** `mt-*` / `mb-*` entre irmãos que podem compartilhar o mesmo `Stack` pai.

**Substituir** `space-y-*` por `Stack` com o mesmo valor de `gap`.

---

## 3. Componente `Stack`

**Arquivo:** `src/components/ui/stack.tsx`

**Padrão:** alinhado a `Button` — `cva` + `cn` + `forwardRef`.

### 3.1 API

```tsx
<Stack gap={4}>                    {/* flex-col gap-4 — default */}
<Stack direction="row" gap={4} wrap>
<Stack gap={8} align="center" className="...">
```

| Prop        | Valores                                                 | Default |
| ----------- | ------------------------------------------------------- | ------- |
| `gap`       | `0.5`, `1`, `2`, `3`, `4`, `6`, `8`, `10`, `12`, `16`   | `4`     |
| `direction` | `col`, `row`                                            | `col`   |
| `align`     | `start`, `center`, `end`, `stretch`, `baseline`         | —       |
| `justify`   | `start`, `center`, `end`, `between`, `around`, `evenly` | —       |
| `wrap`      | boolean                                                 | `false` |

- Elemento padrão: `div`
- `className` mesclado com `cn()`
- `asChild` / Slot: **não** no MVP (adicionar só se necessário)

### 3.2 Implementação (classes)

- Base: `flex`
- `direction: col` → `flex-col`; `row` → `flex-row`
- `gap`: `gap-0.5` … `gap-16` (mapa 1:1 com escala Tailwind já usada no projeto)
- `wrap`: `flex-wrap`

### 3.3 Testes

`src/components/ui/stack.test.tsx`:

- Renderiza filhos
- Aplica `flex-col` e `gap-4` por default
- `direction="row"` + `gap={8}` geram classes esperadas

---

## 4. Preservar o visual (pilhas aninhadas)

Um único `gap` na coluna inteira **altera** o layout quando ritmos mistos existem hoje. Usar **vários `Stack` aninhados** com gaps distintos.

### 4.1 Mapeamento `mt-*` → `gap`

| Antes (margin em filho) | Depois            |
| ----------------------- | ----------------- |
| `mt-0.5`                | `Stack gap={0.5}` |
| `mt-1`                  | `gap={1}`         |
| `mt-2`                  | `gap={2}`         |
| `mt-3`                  | `gap={3}`         |
| `mt-4`                  | `gap={4}`         |
| `mt-6`                  | `gap={6}`         |
| `mt-8`                  | `gap={8}`         |
| `mt-10`                 | `gap={10}`        |
| `mt-12`                 | `gap={12}`        |
| `mt-16`                 | `gap={16}`        |

### 4.2 Exemplos por tela

**Hero (coluna esquerda)**

```
Stack gap={4}  → tagline, h1, parágrafo
Stack gap={8}  → [bloco acima], linha de botões (flex row gap-4)
```

**WhatWeDo (conteúdo da seção)**

```
Stack gap={10} → header, grid de cards, Stack interno
  Stack gap={8} → parágrafo, CTA centralizado
```

**PricingPage**

```
Stack gap={8}  → header (Stack gap={4}: h1 + p), PaymentNotice
Stack gap={10} → lista de ProductPricingCard
Stack gap={12} → footer “Dúvidas?”
```

**ProductPricingCard (coluna direita)**

```
Stack gap={6} → título+capacidade (Stack gap={1}), planos, combos, details, CTA
```

Dentro de combo card: `Stack gap={3}` (label, preço, botão) em vez de `mt-2` / `mt-3`.

**HowItWorks**

- Remover `mt-16` da `<section>`; espaçamento vem do `Stack` pai em `PricingPage`
- Cada `<li>` do grid: `Stack gap={4}` (número, título, texto) em vez de `mt-4` / `mt-2` nos filhos

### 4.3 Exceções de margin (manter)

| Local                      | Classe                     | Motivo                                                                      |
| -------------------------- | -------------------------- | --------------------------------------------------------------------------- |
| Shells de página           | `mx-auto` + `px-*`         | Centralizar e padding horizontal de página                                  |
| Header / Footer / seções   | `mx-auto max-w-7xl px-4 …` | Container — fora do escopo desta spec                                       |
| MobileMenu painel          | `ml-auto`                  | Painel à direita no overlay                                                 |
| `order/page.tsx`           | `-mt-8`                    | Overlap intencional do botão voltar — manter com comentário `/* overlap */` |
| Listas `<ul>` com marcador | `pl-5` em regras do card   | Padding de lista, não margin entre irmãos                                   |

---

## 5. Arquivos a refatorar

| Arquivo                                               | Mudança principal                        |
| ----------------------------------------------------- | ---------------------------------------- |
| `src/components/ui/stack.tsx`                         | **Novo**                                 |
| `src/components/ui/stack.test.tsx`                    | **Novo**                                 |
| `src/components/home/Hero/index.tsx`                  | Stacks aninhados na coluna de texto      |
| `src/components/home/WhatWeDo/index.tsx`              | Stack na seção; remover `mt-10` / `mt-8` |
| `src/components/home/ContactStrip/index.tsx`          | Stack em item com `mt-1`                 |
| `src/components/icons/Logo/index.tsx`                 | `Stack gap={0.5}`                        |
| `src/components/pricing/PricingPage/index.tsx`        | Stacks + remover wrappers só com `mt-*`  |
| `src/components/pricing/ProductPricingCard/index.tsx` | Stack na coluna; combos; details         |
| `src/components/pricing/HowItWorks/index.tsx`         | Stack nos itens; section sem `mt-16`     |
| `src/components/pricing/PaymentNotice/index.tsx`      | `Stack gap={1}`                          |
| `src/components/layout/PlaceholderPage/index.tsx`     | `Stack gap={4}`                          |
| `src/app/order/page.tsx`                              | Stacks no conteúdo; manter `-mt-8`       |
| `AGENTS.md`                                           | Seção curta “Espaçamento” (tabela da §2) |

**Não alterar** (já corretos ou fora do padrão Stack):

- `Button`, `Input` — padding interno
- Grids com `gap` (Hero grid 2 col, ContactStrip, cards grid)
- `Header/index.tsx` — só `mx-auto` / `gap-4` no flex existente

---

## 6. Documentação do projeto

Adicionar em `AGENTS.md` (após regras Next.js):

```markdown
## Espaçamento (Tailwind)

- Entre irmãos no mesmo grupo: `Stack` ou `flex` + `gap` — não `mt-*` / `space-y-*`.
- Inset de página/card/controle: `padding`.
- Margin permitida: `mx-auto`, `ml-auto`/`mr-auto`, margem negativa documentada.
- Ritmos diferentes na mesma coluna: `Stack` aninhados com `gap` distintos.
```

---

## 7. Verificação

1. `pnpm test` — testes existentes + `stack.test.tsx`
2. `pnpm build`
3. Comparar visualmente **home** e **`/pricing`** (mobile + desktop): espaços entre título/parágrafo/CTA, cards, seção How it works, footer da pricing

Critério de aceite: **nenhuma diferença perceptível** de espaçamento em relação ao estado pré-refactor (tolerância zero em `gap` equivalente ao `mt` removido).

---

## 8. Próximo passo

Após revisão desta spec: invocar skill **writing-plans** para plano de implementação tarefa a tarefa.
