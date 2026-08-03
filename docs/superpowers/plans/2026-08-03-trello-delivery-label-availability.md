# Contagem Trello por label Entregar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Contar ocupação diária no Trello apenas por cards com a label Entregar, usando colunas no formato curto `DIA - DD/MM`.

**Architecture:** Atualizar parse/build de nomes de coluna em `list-name.ts`. Em `client.ts`, buscar cards abertos do board de uma vez (`idList` + `idLabels`) e agregar contagens por data só para cards com `labelIdEntregar`. `findOrCreateEntregarList` passa a criar/encontrar o formato curto automaticamente via `buildEntregarListName`. UI e contrato da API permanecem iguais.

**Tech Stack:** Next.js (route já existente), Vitest, Trello REST API, TypeScript.

**Spec:** `docs/superpowers/specs/2026-08-03-trello-delivery-label-availability-design.md`

## Global Constraints

- Contar só cards com `TRELLO_LABEL_ID_ENTREGAR` (ID fixo no env).
- Colunas: formato curto `SEGUNDA|TERÇA|QUARTA|QUINTA|SEXTA|SÁBADO - DD/MM` (sem `-FEIRA`, sem prefixo `ENTREGAR`).
- Formato legado `ENTREGAR - …` / `RETIRAR - …` → `parseEntregarListDate` retorna `null`.
- Fórmula de vagas inalterada: `max − (trelloCount + pending)`.
- Sem mudança no contrato de `GET /api/availability/delivery-dates` nem no `DeliveryDateField`.
- Conventional Commits em português; commits frequentes por task.

---

## File map

| File                                                   | Responsibility                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `src/lib/scheduling/list-name.ts`                      | Build/parse do nome curto da coluna                                |
| `src/lib/scheduling/list-name.test.ts`                 | Testes do formato curto / rejeição do legado                       |
| `src/lib/trello/client.ts`                             | Fetch board-wide de cards + contagem por label/data                |
| `src/lib/trello/client.test.ts`                        | Testes da contagem (criar)                                         |
| `src/lib/trello/find-or-create-entregar-list.test.ts`  | Expectativas no formato curto                                      |
| `src/lib/scheduling/get-delivery-date-availability.ts` | Passar config com `labelIdEntregar` (ajuste de tipo se necessário) |
| `docs/deploy-producao.md`                              | Nota de migração do board                                          |
| Spec 2026-06-03                                        | Nota de supersessão na seção Trello (opcional, Task 4)             |

---

### Task 1: Formato curto de coluna (`list-name`)

**Files:**

- Modify: `src/lib/scheduling/list-name.ts`
- Modify: `src/lib/scheduling/list-name.test.ts`
- Test: `src/lib/scheduling/list-name.test.ts`

**Interfaces:**

- Consumes: none
- Produces:
  - `buildEntregarListName(date: Date): string` → ex. `"TERÇA - 09/06"`
  - `parseEntregarListDate(name: string, year: number): string | null` → ISO `YYYY-MM-DD` ou `null`

- [ ] **Step 1: Atualizar testes para o formato curto (falhando)**

Substituir o conteúdo de `src/lib/scheduling/list-name.test.ts` por:

```ts
import { describe, expect, it } from "vitest";

import { buildEntregarListName, parseEntregarListDate } from "./list-name";

describe("buildEntregarListName", () => {
  it("formats short weekday and date", () => {
    const date = new Date(2026, 5, 9);
    expect(buildEntregarListName(date)).toBe("TERÇA - 09/06");
  });

  it("formats saturday without -FEIRA", () => {
    const date = new Date(2026, 7, 8);
    expect(buildEntregarListName(date)).toBe("SÁBADO - 08/08");
  });
});

describe("parseEntregarListDate", () => {
  it("parses short list title", () => {
    expect(parseEntregarListDate("QUARTA - 05/08", 2026)).toBe("2026-08-05");
  });

  it("parses tuesday short title", () => {
    expect(parseEntregarListDate("TERÇA - 09/06", 2026)).toBe("2026-06-09");
  });

  it("ignores legacy ENTREGAR lists", () => {
    expect(parseEntregarListDate("ENTREGAR - TERÇA-FEIRA - 09/06", 2026)).toBe(
      null,
    );
  });

  it("ignores RETIRAR lists", () => {
    expect(parseEntregarListDate("RETIRAR - TERÇA-FEIRA - 09/06", 2026)).toBe(
      null,
    );
  });

  it("ignores unrelated lists", () => {
    expect(parseEntregarListDate("A AGENDAR", 2026)).toBe(null);
  });
});
```

- [ ] **Step 2: Rodar testes e confirmar falha**

Run: `pnpm exec vitest run src/lib/scheduling/list-name.test.ts`

Expected: FAIL — expectativas ainda apontam para `ENTREGAR - TERÇA-FEIRA - 09/06` / parse legado.

- [ ] **Step 3: Implementar formato curto em `list-name.ts`**

Substituir `WEEKDAY_PT` e o pattern; atualizar `buildEntregarListName`:

```ts
const WEEKDAY_PT_SHORT = [
  "DOMINGO",
  "SEGUNDA",
  "TERÇA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SÁBADO",
] as const;

const DELIVERY_LIST_PATTERN =
  /^(SEGUNDA|TERÇA|QUARTA|QUINTA|SEXTA|SÁBADO)\s*-\s*(\d{2})\/(\d{2})\s*$/i;
```

```ts
export function buildEntregarListName(date: Date): string {
  const weekday = WEEKDAY_PT_SHORT[date.getDay()];
  const day = pad2(date.getDate());
  const month = pad2(date.getMonth() + 1);

  return `${weekday} - ${day}/${month}`;
}

export function parseEntregarListDate(
  name: string,
  year: number,
): string | null {
  const match = name.trim().match(DELIVERY_LIST_PATTERN);

  if (!match) {
    return null;
  }

  const day = Number(match[2]);
  const month = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${pad2(month)}-${pad2(day)}`;
}
```

Manter `formatIsoDateLocal` / `parseIsoDateLocal` como estão. Remover o pattern antigo `ENTREGAR_LIST_PATTERN` e o array longo `WEEKDAY_PT` se não forem mais usados.

Nota: o parse **não** valida se o weekday do título bate com o calendário — só extrai `DD/MM` (igual ao comportamento atual com o prefixo ENTREGAR). YAGNI.

- [ ] **Step 4: Rodar testes e confirmar passagem**

Run: `pnpm exec vitest run src/lib/scheduling/list-name.test.ts`

Expected: PASS

- [ ] **Step 5: Atualizar testes de `findOrCreateEntregarList`**

Em `src/lib/trello/find-or-create-entregar-list.test.ts`, trocar o nome mockado e o título do teste:

```ts
it("returns existing list id when day list matches date", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: "list456", name: "TERÇA - 09/06" }],
    }),
  );

  const result = await findOrCreateEntregarList("2026-06-09", config);

  expect(result).toEqual({ listId: "list456" });
});

it("creates list when day list does not exist", async () => {
  // ... mesma estrutura de mocks; assert listId list789
});
```

Opcional no teste de create: assertar que a URL/body de criação usa `name=TERÇA - 09/06` (via `fetchMock.mock.calls`).

Run: `pnpm exec vitest run src/lib/trello/find-or-create-entregar-list.test.ts`

Expected: PASS (a implementação de `findOrCreateEntregarList` já usa `buildEntregarListName` / `parseEntregarListDate` — não precisa mudar o `.ts` de produção).

- [ ] **Step 6: Commit**

```bash
git add src/lib/scheduling/list-name.ts src/lib/scheduling/list-name.test.ts src/lib/trello/find-or-create-entregar-list.test.ts
git commit -m "$(cat <<'EOF'
feat(scheduling): formato curto DIA - DD/MM nas colunas Trello

EOF
)"
```

---

### Task 2: Contagem board-wide por label Entregar

**Files:**

- Modify: `src/lib/trello/client.ts`
- Create: `src/lib/trello/client.test.ts`
- Modify: `src/lib/scheduling/get-delivery-date-availability.ts` (só se a assinatura exigir `labelIdEntregar` explicitamente — tipicamente já passa `config` inteiro)

**Interfaces:**

- Consumes: `parseEntregarListDate` (Task 1), `TrelloConfig.labelIdEntregar`
- Produces:
  - `fetchEntregarCardCountsByDate(boardId, year, config: Pick<TrelloConfig, "apiKey" | "token" | "labelIdEntregar">): Promise<Record<string, number> | { error: string }>`
  - Contagem = cards abertos cuja lista parseia para a data **e** `idLabels` inclui `labelIdEntregar`

- [ ] **Step 1: Escrever testes falhando em `client.test.ts`**

Criar `src/lib/trello/client.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchEntregarCardCountsByDate } from "./client";

const config = {
  apiKey: "key",
  token: "token",
  labelIdEntregar: "label-entregar",
};

describe("fetchEntregarCardCountsByDate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("counts only open cards with Entregar label on short-named lists", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: "list-qua", name: "QUARTA - 05/08" },
          { id: "list-other", name: "A AGENDAR" },
          { id: "list-legacy", name: "ENTREGAR - QUARTA-FEIRA - 05/08" },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "c1",
            idList: "list-qua",
            idLabels: ["label-entregar"],
          },
          {
            id: "c2",
            idList: "list-qua",
            idLabels: ["label-entregar", "other"],
          },
          {
            id: "c3",
            idList: "list-qua",
            idLabels: [],
          },
          {
            id: "c4",
            idList: "list-legacy",
            idLabels: ["label-entregar"],
          },
        ],
      });

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchEntregarCardCountsByDate(
      "board123",
      2026,
      config,
    );

    expect(result).toEqual({ "2026-08-05": 2 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns empty object when no matching lists", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: "x", name: "Inbox" }],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        }),
    );

    const result = await fetchEntregarCardCountsByDate(
      "board123",
      2026,
      config,
    );

    expect(result).toEqual({});
  });

  it("returns error when lists request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401 }),
    );

    const result = await fetchEntregarCardCountsByDate(
      "board123",
      2026,
      config,
    );

    expect(result).toEqual({ error: "Trello API 401" });
  });
});
```

- [ ] **Step 2: Rodar teste e confirmar falha**

Run: `pnpm exec vitest run src/lib/trello/client.test.ts`

Expected: FAIL — ainda conta todos os cards por lista (ou assinatura/implementação antiga não filtra por label).

- [ ] **Step 3: Implementar fetch board-wide + filtro por label**

Em `src/lib/trello/client.ts`:

1. Adicionar helper (ou função exportada se preferir testar isolado):

```ts
type TrelloCardSummary = {
  id: string;
  idList: string;
  idLabels: string[];
};

export async function fetchOpenBoardCards(
  boardId: string,
  config: Pick<TrelloConfig, "apiKey" | "token">,
): Promise<TrelloCardSummary[] | { error: string }> {
  const params = buildAuthParams(config);
  params.set("fields", "id,idList,idLabels");
  params.set("filter", "open");

  try {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}/cards?${params}`,
    );

    if (!response.ok) {
      return { error: `Trello API ${response.status}` };
    }

    return (await response.json()) as TrelloCardSummary[];
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro de rede ao chamar Trello.";
    return { error: message };
  }
}
```

2. Reescrever `fetchEntregarCardCountsByDate`:

```ts
export async function fetchEntregarCardCountsByDate(
  boardId: string,
  year: number,
  config: Pick<TrelloConfig, "apiKey" | "token" | "labelIdEntregar">,
): Promise<Record<string, number> | { error: string }> {
  const lists = await fetchTrelloLists(boardId, config);

  if ("error" in lists) {
    return lists;
  }

  const listIdToDate = new Map<string, string>();

  for (const list of lists) {
    const date = parseEntregarListDate(list.name, year);
    if (date) {
      listIdToDate.set(list.id, date);
    }
  }

  if (listIdToDate.size === 0) {
    return {};
  }

  const cards = await fetchOpenBoardCards(boardId, config);

  if ("error" in cards) {
    return cards;
  }

  const counts: Record<string, number> = {};

  for (const card of cards) {
    const date = listIdToDate.get(card.idList);
    if (!date) {
      continue;
    }

    if (!card.idLabels?.includes(config.labelIdEntregar)) {
      continue;
    }

    counts[date] = (counts[date] ?? 0) + 1;
  }

  return counts;
}
```

3. `countOpenCardsInList`: se nada mais no repo importar, **remover** a função neste passo (YAGNI). Se preferir deixar, ok — mas o plano recomenda remover para evitar uso acidental da contagem antiga.

- [ ] **Step 4: Confirmar que `get-delivery-date-availability` tipa certo**

Em `get-delivery-date-availability.ts`, a chamada já passa `config` (com `labelIdEntregar`). Rodar typecheck se necessário:

Run: `pnpm typecheck`

Se houver erro de tipo no `Pick` antigo sem `labelIdEntregar`, a Task 2 Step 3 já corrige a assinatura — nenhuma lógica de negócio muda neste arquivo.

- [ ] **Step 5: Rodar testes**

Run:

```bash
pnpm exec vitest run src/lib/trello/client.test.ts src/lib/scheduling/list-name.test.ts src/lib/trello/find-or-create-entregar-list.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/trello/client.ts src/lib/trello/client.test.ts src/lib/scheduling/get-delivery-date-availability.ts
git commit -m "$(cat <<'EOF'
feat(trello): contar disponibilidade só por label Entregar

EOF
)"
```

---

### Task 3: Docs de operação + verificação

**Files:**

- Modify: `docs/deploy-producao.md` (seção Agendamento de entrega)
- Modify (opcional): `docs/superpowers/specs/2026-06-03-delivery-scheduling-design.md` — adicionar nota no topo apontando para a spec 2026-08-03

**Interfaces:**

- Consumes: comportamento das Tasks 1–2
- Produces: docs alinhados ao board novo

- [ ] **Step 1: Atualizar `docs/deploy-producao.md`**

Na seção **Agendamento de entrega**, substituir a linha sobre colunas ENTREGAR por algo nesta linha:

```markdown
- Disponibilidade: colunas de data no Trello no formato `DIA - DD/MM` (ex.: `QUARTA - 05/08`); conta só cards com a label Entregar (`TRELLO_LABEL_ID_ENTREGAR`) + reservas `pending` no Supabase (máx. 6/dia).
- Cards de organização (entregador/rota) **não** devem ter a label Entregar.
- Colunas legadas `ENTREGAR - …` não entram na contagem — renomear para o formato curto.
```

- [ ] **Step 2: Nota na spec antiga (opcional mas recomendado)**

No topo de `docs/superpowers/specs/2026-06-03-delivery-scheduling-design.md`, após o cabeçalho:

```markdown
> **Atualização 2026-08-03:** a contagem Trello e o nome das colunas foram alterados — ver `2026-08-03-trello-delivery-label-availability-design.md`.
```

- [ ] **Step 3: Suite de regressão rápida**

Run:

```bash
pnpm exec vitest run src/lib/scheduling src/lib/trello
pnpm typecheck
```

Expected: PASS / sem erros de tipo.

- [ ] **Step 4: Commit**

```bash
git add docs/deploy-producao.md docs/superpowers/specs/2026-06-03-delivery-scheduling-design.md
git commit -m "$(cat <<'EOF'
docs: alinhar agendamento Trello ao formato curto e label Entregar

EOF
)"
```

- [ ] **Step 5: Smoke manual (quando tiver env Trello)**

```bash
pnpm dev
# curl http://localhost:3000/api/availability/delivery-dates
```

Conferir: dias com só cards de organização mostram vagas cheias (menos pending); dias com N cards label Entregar reduzem `slotsRemaining` em N.

---

## Spec coverage (self-review)

| Spec                                        | Task                                                               |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Contar só label Entregar                    | Task 2                                                             |
| Coluna `DIA - DD/MM` curto                  | Task 1                                                             |
| Criar coluna no formato curto pós-pagamento | Task 1 (via `buildEntregarListName` usado por `findOrCreate`)      |
| Ignorar legado ENTREGAR                     | Task 1 + teste Task 2                                              |
| Fórmula / API / UI inalteradas              | Task 2 (sem mudar availability formula) + fora de escopo explícito |
| Docs migração board                         | Task 3                                                             |
| Aceite: 3 org + 2 label → ocupação 2        | Task 2 teste                                                       |

Sem placeholders. Assinatura `fetchEntregarCardCountsByDate` inclui `labelIdEntregar` de forma consistente em Tasks 2–3.
