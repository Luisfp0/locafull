<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Espaçamento (Tailwind)

- Entre irmãos no mesmo grupo de layout: prefira `flex` + `gap`; evite `mt-*` / `mb-*` e `space-y-*` entre irmãos (margin legítima: `mx-auto`, `ml-auto`, overlap documentado).
- Inset de página, card ou controle: use `padding` (`p-*`, `px-*`, `py-*`).
- Margin só quando necessário: `mx-auto` (container), `ml-auto` / `mr-auto` (alinhamento no flex), margem negativa pontual com comentário no código.
- Ritmos verticais diferentes na mesma coluna: `flex flex-col` aninhados com `gap` distintos (não um único `gap` na coluna inteira).

## Pastas de componente

- Cada componente: `index.tsx` + `types.ts` (`NomeProps`, sem prefixo `I` obrigatório).
- `constants.ts` para dados estáticos; `utils.ts` para funções — só daquele escopo.
- Subcomponentes em `components/<Sub>/` com a mesma estrutura.
- `app/` fino: rota + metadata; UI em `components/`.
- Dados/tipos de feature: `components/<feature>/types.ts`, `constants.ts`, `utils.ts`.
