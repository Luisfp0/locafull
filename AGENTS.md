<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Espaçamento (Tailwind)

- Entre irmãos no mesmo grupo de layout: use `Stack` (`src/components/ui/stack.tsx`) ou `flex` + `gap` — evite `mt-*` / `mb-*` e `space-y-*` entre irmãos.
- Inset de página, card ou controle: use `padding` (`p-*`, `px-*`, `py-*`).
- Margin só quando necessário: `mx-auto` (container), `ml-auto` / `mr-auto` (alinhamento no flex), margem negativa pontual com comentário no código.
- Ritmos verticais diferentes na mesma coluna: `Stack` aninhados com `gap` distintos (não um único `gap` na coluna inteira).

Ver `docs/superpowers/specs/2026-05-19-spacing-stack-design.md`.
