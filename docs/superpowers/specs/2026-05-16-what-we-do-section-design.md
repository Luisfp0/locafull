# Locafull — Seção “O que nós fazemos” (home)

**Data:** 2026-05-16  
**Status:** Aprovado para implementação  
**Escopo:** Nova seção na landing entre Hero e ContactStrip

---

## 1. Objetivo

Adicionar na home uma seção **“O que nós fazemos”** inspirada no layout da referência (Limp Entulho), com **identidade Locafull** (navy + laranja, tipografia e tokens existentes).

A seção apresenta os três produtos principais (mini caçambas, tambores, barris) e comunica **entrega e retirada agendada** no parágrafo descritivo — combinando as opções de conteúdo A (produtos) e B (operação) sem um quarto card.

**Posição na página:**

```
Hero → WhatWeDo → ContactStrip → Footer
```

**Fora do escopo:** animações Framer, vídeo, carrossel, página `/servicos` completa (continua placeholder).

---

## 2. Conteúdo

### 2.1 Cabeçalho da seção

| Elemento  | Texto             |
| --------- | ----------------- |
| Título    | O que nós fazemos |
| Subtítulo | veja abaixo       |

Ambos centralizados, texto branco sobre fundo escuro.

### 2.2 Cards (3 colunas no desktop)

| #   | Título do card           | Imagem (arquivo sugerido)                     | Alt (acessibilidade)                                  |
| --- | ------------------------ | --------------------------------------------- | ----------------------------------------------------- |
| 1   | Locação de mini caçambas | `public/images/servicos/cacamba-corredor.jpg` | Mini caçamba Locafull em corredor de obra com entulho |
| 2   | Locação de tambores      | `public/images/servicos/tambor-reforma.jpg`   | Tambor Locafull com rodízios em ambiente de reforma   |
| 3   | Locação de barris        | `public/images/servicos/tambor-entulho.jpg`   | Tambor Locafull cheio de entulho de construção        |

**Nota:** Não há foto específica de barril no material enviado; usar `tambor-entulho.jpg` até haver asset dedicado. Título do card permanece “Locação de barris”.

### 2.3 Parágrafo descritivo

Texto sugerido (centralizado, max-width ~42rem):

> Somos especialistas em locação de mini caçambas, tambores e barris para obras, reformas e limpeza de terrenos em Goiânia e região. Fazemos a entrega e a retirada no local, com agilidade e equipamentos ideais para espaços menores.

Ajustes de copy finos são permitidos na implementação desde que mantenham os três produtos e a menção à entrega/retirada.

### 2.4 CTA

| Label      | Destino   | Variante `Button`   |
| ---------- | --------- | ------------------- |
| Peça agora | `/pedido` | `default` (laranja) |

Centralizado abaixo do parágrafo.

---

## 3. Layout e visual (Locafull)

### 3.1 Fundo

- Seção com gradiente alinhado ao hero: `bg-gradient-to-br from-primary via-primary-light to-primary` (ou equivalente com tokens `@theme`).
- Padding vertical generoso: `py-16` mobile, `py-20` desktop.
- Opcional: overlay sutil com imagem desfocada de fundo — **não** no MVP (YAGNI).

### 3.2 Grid de cards

- Mobile: 1 coluna, `gap-6`.
- Tablet+: 3 colunas, `gap-6` / `gap-8`.
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.

### 3.3 Card

```
┌─────────────────────┐
│      [foto]         │  aspect-[4/3], rounded-t-2xl, object-cover
├─────────────────────┤
│  Título do serviço  │  fundo branco, rounded-b-2xl, py-4 px-3
└─────────────────────┘     text-primary font-bold text-center text-sm sm:text-base
```

- Card inteiro: `overflow-hidden rounded-2xl shadow-brand`.
- Sem link nos cards no MVP (apenas informativos).

### 3.4 Tipografia

- Título seção: `text-headline-4` ou `text-2xl sm:text-3xl font-bold text-white`.
- Subtítulo: `text-sm text-gray-100` ou `text-alert-3`.
- Parágrafo: `text-base text-gray-100 leading-relaxed`.

---

## 4. Arquitetura técnica

### 4.1 Componente

```
src/components/home/WhatWeDo/
  index.tsx       # export WhatWeDo
  types.ts        # export interface IWhatWeDo { className?: string }
```

### 4.2 Dados

Constante exportada em `src/lib/constants.ts`:

```ts
export const WHAT_WE_DO_ITEMS = [
  { title: string; imageSrc: string; imageAlt: string },
  ...
] as const;
```

Componente mapeia `WHAT_WE_DO_ITEMS` com `next/image` (`fill` + container `relative aspect-[4/3]`).

### 4.3 Integração na home

`src/app/page.tsx`:

```tsx
<Hero />
<WhatWeDo />
<ContactStrip />
```

### 4.4 Assets

Copiar fotos fornecidas pelo cliente para:

```
public/images/servicos/
  cacamba-corredor.jpg    # corredor estreito / obra
  tambor-reforma.jpg      # tambor com rodízios em reforma
  tambor-entulho.jpg      # tambor cheio (card barris)
```

Formato: JPEG ou WebP; otimizar se > 300 KB cada. Usar `sizes="(max-width: 768px) 100vw, 33vw"` no `Image`.

---

## 5. Acessibilidade e SEO

- `<section aria-labelledby="what-we-do-heading">`.
- `<h2 id="what-we-do-heading">` para o título da seção (único h2 neste bloco).
- Títulos dos cards: `<h3>` dentro de cada card.
- `alt` descritivo em cada imagem (ver tabela §2.2).
- Contraste: texto branco sobre `primary` — validar WCAG AA.

---

## 6. Testes

| Teste             | O que verifica                               |
| ----------------- | -------------------------------------------- |
| `WhatWeDo` render | 3 cards com títulos esperados                |
| CTA               | Link `href="/pedido"` com texto “Peça agora” |

Arquivo sugerido: `src/components/home/WhatWeDo/what-we-do.test.tsx` (Vitest + Testing Library).

---

## 7. Critérios de aceite

- [ ] Seção visível entre Hero e ContactStrip em `/`.
- [ ] Três cards com imagens reais Locafull e títulos corretos.
- [ ] Parágrafo menciona caçambas, tambores, barris e entrega/retirada.
- [ ] CTA “Peça agora” leva a `/pedido`.
- [ ] Responsivo: 1 col mobile, 3 cols desktop.
- [ ] Sem hex solto; classes Tailwind + tokens existentes.
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm build` passando.

---

## 8. Referências

- Layout inspirado: seção “O que nós fazemos” Limp Entulho (3 cards + texto + CTA).
- Spec base do projeto: `docs/superpowers/specs/2026-05-16-locafull-landing-design.md`.
- Decisão de conteúdo: abordagem 1 (três produtos + entrega no parágrafo), aprovada em brainstorming.
