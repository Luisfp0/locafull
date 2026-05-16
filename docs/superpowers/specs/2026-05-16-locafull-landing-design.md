# Locafull — Design da landing e base do frontend

**Data:** 2026-05-16  
**Status:** Aprovado para implementação  
**Escopo:** MVP marketing + estrutura para pedido/checkout no mesmo app

---

## 1. Objetivo

Site único **Locafull** (locação de mini caçambas, tambores e barris — Goiânia e região) com:

- Landing mobile-first inspirada no layout da referência Limp Entulho, com **identidade visual Locafull**
- Rotas placeholder para fluxo comercial futuro (`/pedido`, `/checkout`)
- Menu com links reais; páginas internas mínimas exceto home
- Botão WhatsApp flutuante e contato **(62) 3030-0077**
- Instagram: [@locafull_locacoes](https://www.instagram.com/locafull_locacoes/)
- Slogan: _Agilidade que movimenta sua obra_

**Fora do MVP:** seção “Nossa história”, pedido/pagamento/agenda, admin, logística, analytics, domínio próprio, Framer Motion, MUI.

---

## 2. Stack

| Camada    | Decisão                                                            |
| --------- | ------------------------------------------------------------------ |
| Framework | Next.js (App Router) + TypeScript                                  |
| Pacotes   | pnpm                                                               |
| UI        | Tailwind CSS + shadcn/ui                                           |
| Fontes    | Plus Jakarta Sans (headings) + Inter (body) via `next/font/google` |
| Ícones    | Lucide React + SVGs próprios (logo, WhatsApp, Instagram)           |
| Animações | CSS/Tailwind + `prefers-reduced-motion`                            |
| Deploy    | Vercel (`*.vercel.app` no MVP)                                     |
| Qualidade | ESLint (Next) + Prettier + Husky + lint-staged + `strict` TS       |
| Testes    | Vitest + Testing Library (componentes e utils)                     |
| Imagens   | `next/image` para fotos; SVG inline para marca                     |

---

## 3. Arquitetura de pastas

```
src/
  app/
    layout.tsx
    page.tsx                          # home
    (marketing)/
      sobre/page.tsx
      servicos/page.tsx               # "O que fazemos"
      diferenciais/page.tsx
      contato/page.tsx
    pedido/page.tsx                   # placeholder
    checkout/page.tsx                 # placeholder
  components/
    ui/                               # shadcn: Button, Input, …
    layout/                           # Header, Footer, FloatingWhatsApp
    home/                             # Hero, ContactStrip
    icons/                            # Logo, WhatsAppIcon, InstagramIcon
  lib/
    constants.ts                      # phone, menu, URLs públicas
    utils.ts                          # cn(), formatPhone, buildWaLink
  styles/
    globals.css                       # imports + resets + utilitários globais
    tokens.css                        # :root — variáveis CSS (padrão admin global.css)
  types/                              # APENAS tipos globais (.d.ts, augmentations)
```

`app/` apenas orquestra rotas; lógica visual em `components/`.

### 3.1 Tipos TypeScript (igual admin-checkout-front)

**Não** centralizar props de componentes em `src/types/`.

| Local                                             | Conteúdo                                                                                                          |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/types/`                                      | Somente declarações **globais**: `*.d.ts`, augmentations (ex. módulos sem types), tipos de ambiente se necessário |
| `src/components/<Nome>/types.ts`                  | Props e tipos **daquele** componente (ex. `IHeader`, `IHero`)                                                     |
| `src/components/<Nome>/components/<Sub>/types.ts` | Subcomponentes, como no admin (`TemplateLayout/components/Layout/types.ts`)                                       |

**Padrão por pasta de componente** (espelho admin):

```
components/layout/Header/
  index.tsx          # exporta Header; importa de ./types
  types.ts           # export interface IHeader { ... }
  components/
    MobileMenu/
      index.tsx
      types.ts
```

- Interfaces com prefixo **`I`** + nome do componente: `IHeader`, `IHero`, `IFloatingWhatsApp`.
- Tipos compartilhados entre **vários** componentes da mesma feature → `components/home/types.ts` ou `lib/types/order.ts` (raro no MVP).
- Tipos de domínio (Pedido, Plano) no futuro → `src/domain/` ou `src/types/models/` — não misturar com props de UI.

---

## 4. Rotas e menu

| Menu          | Rota            | MVP                        |
| ------------- | --------------- | -------------------------- |
| Home          | `/`             | Landing completa           |
| Sobre nós     | `/sobre`        | Placeholder “Em breve”     |
| O que fazemos | `/servicos`     | Placeholder                |
| Diferenciais  | `/diferenciais` | Placeholder                |
| Contato       | `/contato`      | Placeholder ou página leve |
| —             | `/pedido`       | Placeholder                |
| —             | `/checkout`     | Placeholder                |

**Header:** logo, links, Instagram, pill WhatsApp com número.

---

## 5. Design tokens (CSS único — ideal para Tailwind)

**Fonte da verdade:** apenas `src/styles/tokens.css` (`:root`).

- **Mesmos nomes de variáveis** do `global.css` do admin (`--primary`, `--gray-100`, `--alert-2`, `--font-body4`, …).
- **Valores da marca Locafull** (não os hex do Firepay).
- **Sem** `palette.ts`, **sem** MUI, **sem** segunda camada em TypeScript.
- Tailwind e shadcn leem `var(--*)` via `tailwind.config` / `@theme` e variantes de componente.

| Arquivo                  | Papel                                                                        |
| ------------------------ | ---------------------------------------------------------------------------- |
| `src/styles/tokens.css`  | **Única** fonte de cores, tipografia, radius, sombras, z-index               |
| `src/styles/globals.css` | `@import "./tokens.css"`, Tailwind, resets (`box-sizing`, `body`), scrollbar |

**Regra:** nenhum hex solto em componentes — só `var(--nome)` ou classes Tailwind mapeadas para essas vars.

### 5.1 Cores Locafull (variáveis CSS)

| Variável                   | Hex          | Uso                                              |
| -------------------------- | ------------ | ------------------------------------------------ |
| `--primary`                | `#1B2A3E`    | Marca, títulos, header, início do gradiente hero |
| `--secondary`              | `#0f1824`    | Hover, footer escuro                             |
| `--primary-light`          | `#2d4158`    | Bordas, fundos suaves (nome alinhado ao admin)   |
| `--alert-2`                | `#F39233`    | CTA laranja (admin usa `--alert-2` para laranja) |
| `--alert-3`                | `#ffe0b2`    | Fundo suave CTA                                  |
| `--success`                | `#25D366`    | Botão WhatsApp                                   |
| `--danger`                 | `#B71C1C`    | Erros (futuro)                                   |
| `--info`                   | `#0288D1`    | Links informativos (futuro)                      |
| `--white`                  | `#FFFFFF`    | Cards, header, faixas                            |
| `--light-gray`             | `#f5f5f5`    | Fundo da página                                  |
| `--light-gray2`            | `#e0e0e0`    | Bordas                                           |
| `--dark-gray`              | `#5E5E5E`    | Texto corpo                                      |
| `--black-1`                | `#171717`    | Labels fortes                                    |
| `--gray-25` … `--gray-900` | escala admin | Divisores; **escala completa** no scaffold       |

**Hero:** `bg-gradient-to-r from-[var(--primary)] to-[var(--alert-2)]` (ou utilitários Tailwind mapeados).

### 5.2 `tokens.css` (trecho ilustrativo)

```css
:root {
  --primary: #1b2a3e;
  --secondary: #0f1824;
  --primary-light: #2d4158;
  --alert-2: #f39233;
  --alert-3: #ffe0b2;
  --success: #25d366;
  --danger: #b71c1c;
  --info: #0288d1;

  --black: #000000;
  --white: #ffffff;
  --white-light: #fbfbfb;
  --black-1: #171717;
  --dark-gray: #5e5e5e;

  --light-gray: #f5f5f5;
  --light-gray2: #e0e0e0;
  --input-background: #fafafa;
  --input-border: #cacaca;

  --gray-25: #fbfbfb;
  --gray-50: #f7f7f7;
  --gray-100: #e0e0e0;
  /* … --gray-150 até --gray-900: escala completa (admin-checkout-front) */

  --semi-transparent-black: rgba(0, 0, 0, 0.6);
  --black-semi-transparent: rgba(0, 0, 0, 0.87);
  --black-very-light-transparent: #0000001f;

  --font-primary: "Inter", sans-serif;
  --font-secondary: "Plus Jakarta Sans", sans-serif;
  --font-weight-bold: 700;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --font-headline4: 2.25rem;
  --font-headline5: 2rem;
  --font-headline6: 1.5rem;
  --font-body4: 1rem;
  --font-body5: 0.875rem;
  --font-body6: 0.75rem;

  --min-width: 360px;
  --border-radius: 12px;
  --border-radius-1: 16px;
  --border-radius-2: 24px;
  --z-index-absolute: 9000;

  --box-shadow-1: 0px 0px 8px 0px rgba(27, 42, 62, 0.15);

  /* shadcn/ui — apontam para tokens Locafull */
  --background: var(--light-gray);
  --foreground: var(--dark-gray);
  --primary-foreground: var(--white);
  --ring: var(--primary-light);
}
```

**MVP:** `tokens.css` com **escala completa** `--gray-25`…`--gray-900` (copiar nomes do admin, valores neutros/Locafull). Variáveis extras (`--purple-600`, `--blue-heaven`, …) entram **sob demanda** com os mesmos nomes do admin.

### 5.3 Tailwind

`tailwind.config.ts` (ou `@theme` no CSS, conforme versão do Next):

```ts
colors: {
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  warning: "var(--alert-2)",
  success: "var(--success)",
  background: "var(--light-gray)",
  foreground: "var(--dark-gray)",
},
borderRadius: {
  DEFAULT: "var(--border-radius)",
},
fontFamily: {
  sans: ["var(--font-primary)"],
  heading: ["var(--font-secondary)"],
},
```

Uso: `bg-warning`, `text-primary`, `rounded-[var(--border-radius)]`, ou `bg-[var(--alert-2)]`.

### 5.4 Tipografia

Tamanhos e pesos só via variáveis em `tokens.css` (`--font-headline4`, `--font-body5`, `--font-weight-bold`).  
Headings com `font-family: var(--font-secondary)`; corpo com `var(--font-primary)`.

### 5.5 Breakpoints

Padrão Tailwind: `sm` 640, `md` 768, `lg` 1024, `xl` 1280. Mobile-first.

| Elemento  | &lt; md                                  | lg+                      |
| --------- | ---------------------------------------- | ------------------------ |
| Menu      | Drawer / hambúrguer                      | Links horizontais        |
| Hero      | Empilhado                                | Texto esq. + imagem dir. |
| Contatos  | 1 coluna                                 | Grid 2–4 colunas         |
| Container | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |                          |

### 5.6 Componentes shadcn

Variantes customizadas em `components/ui/button.tsx`:

- `default` → `background: var(--alert-2)` (CTA)
- `secondary` → `background: var(--primary)`
- `outline` → `border-color: var(--light-gray2)`
- Inputs usam `--input-background`, `--input-border`

---

## 6. Página home (MVP)

1. **Header** — nav + Instagram + WhatsApp pill
2. **Hero** — headline, CTA “Peça agora”, gradiente, imagem/placeholder (`next/image` quando houver foto)
3. **ContactStrip** — telefone, WhatsApp, e-mail, endereço (dados em `lib/constants.ts`)
4. **Footer**
5. **FloatingWhatsApp** — fixo, `wa.me/556230300077`

**Sem** bloco “Nossa história” na v1.

---

## 7. SEO e ambiente

- `metadata` + Open Graph + `lang="pt-BR"`
- JSON-LD `LocalBusiness` (Goiânia, telefone)
- `robots.txt` + `sitemap.xml`

```env
NEXT_PUBLIC_SITE_URL=https://xxx.vercel.app
NEXT_PUBLIC_WHATSAPP_NUMBER=556230300077
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/locafull_locacoes/
```

---

## 8. Tooling e CI

- `pnpm dev | build | lint | format | typecheck | test`
- Husky pre-commit: ESLint + Prettier via lint-staged nos arquivos staged
- Build na Vercel no push

---

## 9. Testes (v1)

Vitest + Testing Library para:

- `Button` (variantes que usam `--alert-2` / `--primary`)
- Utils: `formatPhone`, `buildWaLink`
- Opcional: snapshot mínimo do `Hero`

Sem Playwright no MVP.

---

## 10. README (entregue no scaffold)

- Estrutura de pastas, `types.ts` por componente, `styles/tokens.css` + `globals.css`
- Scripts e Husky
- Como alterar menu, cores (`styles/tokens.css`) e WhatsApp
- Tokens: uma fonte (`tokens.css`), nomes iguais ao `global.css` do admin

---

## 11. Roadmap pós-MVP

1. Páginas marketing completas
2. Fluxo `/pedido` → agenda → `/checkout` (PIX + cartão)
3. Domínio próprio + GA4
4. Painel admin / logística

---

## 12. Referências

- Layout: landing Limp Entulho (hero, contatos, WhatsApp flutuante)
- Marca: logo Locafull, Instagram @locafull_locacoes
- Nomes das variáveis CSS: `admin-checkout-front/src/assets/css/global.css` (valores = Locafull)
