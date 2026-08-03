# Locafull — Disponibilidade por label Entregar (Trello)

**Data:** 2026-08-03  
**Status:** Aprovado (brainstorming)  
**Escopo:** Contar ocupação diária no Trello apenas por cards com a label Entregar; colunas do dia no formato curto `DIA - DD/MM`.  
**Relacionado:** `2026-06-03-delivery-scheduling-design.md` (este doc atualiza a parte Trello/disponibilidade).

---

## 1. Objetivo

O board passou a ter **uma coluna por data** (sem prefixo ENTREGAR/RETIRAR). Dentro da coluna há cards de organização (entregador, rota) e cards de entrega reais, identificados pela **etiqueta Entregar**.

A disponibilidade do checkout deve refletir só as entregas reais: cards abertos com `TRELLO_LABEL_ID_ENTREGAR`.

---

## 2. Decisões

| Tema                          | Decisão                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------- |
| Identificação da entrega      | Somente pela label ID `TRELLO_LABEL_ID_ENTREGAR` (já no env)                    |
| Nome da coluna                | Formato curto: `QUARTA - 05/08`, `SÁBADO - 08/08`                               |
| Dia da semana                 | Curto: `SEGUNDA`, `TERÇA`, `QUARTA`, `QUINTA`, `SEXTA`, `SÁBADO` (sem `-FEIRA`) |
| Formato antigo `ENTREGAR - …` | Deixa de ser reconhecido (leitura e criação)                                    |
| Criação pós-pagamento         | Cria coluna no formato curto se não existir                                     |
| Contagem Trello               | Abordagem board-wide: 1 fetch de cards + filtro por label                       |
| Fórmula de vagas              | Inalterada: `max − (trelloLabelCount + pending Supabase)`                       |
| UI / contrato da API          | Inalterados                                                                     |
| Retirada                      | Fora de escopo (cards de retirada não usam a label Entregar → não contam)       |

---

## 3. Regra de negócio

Para cada data candidata (amanhã … +30 dias, seg–sáb):

```
ocupado_trello = cards abertos na coluna "DIA - DD/MM" com label Entregar
ocupado        = ocupado_trello + pedidos pending no Supabase nessa data
vagas          = maxDeliveriesPerDay − ocupado
disponível se vagas > 0
```

- Coluna inexistente → `ocupado_trello = 0`.
- Cards sem a label Entregar (headers de entregador, rotas, etc.) → ignorados.
- Colunas ainda no padrão antigo `ENTREGAR - …` → **não contam** até renomear no board.

---

## 4. Fluxo técnico

### Disponibilidade (`GET /api/availability/delivery-dates`)

1. Listar colunas do board (`GET /boards/{id}/lists`).
2. Listar cards abertos do board com `idList` + `idLabels` (uma chamada).
3. Mapear `listId → YYYY-MM-DD` só para nomes que casam com `DIA - DD/MM`.
4. Contar cards cuja `idLabels` inclui `labelIdEntregar`, agrupados pela data da lista.
5. Somar pending Supabase e montar resposta via `buildAvailabilityForDates` (como hoje).
6. Cache em memória 5 minutos (mantém).

### Pós-pagamento (criação de card)

1. `findOrCreateEntregarList(scheduled_date)` procura coluna `TERÇA - 09/06` (exemplo).
2. Se não existir, cria com esse nome (`pos: bottom`).
3. Cria o card na lista com `idLabels: labelIdEntregar` (já implementado).

---

## 5. Nomenclatura de coluna

### Build

```
{DIA} - {DD}/{MM}
```

Exemplos: `TERÇA - 09/06`, `QUARTA - 05/08`, `SÁBADO - 08/08`.

### Parse

- Regex alinhada ao build (dia curto + `DD/MM`).
- Ano inferido do contexto (igual ao fluxo atual).
- Não exige prefixo `ENTREGAR`.
- Não aceita `RETIRAR - …` nem `ENTREGAR - …` (legado).

---

## 6. Mudanças de código (previsto)

| Arquivo                                                | Mudança                                                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `src/lib/scheduling/list-name.ts`                      | `buildEntregarListName` / `parseEntregarListDate` → formato curto                                      |
| `src/lib/scheduling/list-name.test.ts`                 | Atualizar expectativas; cobrir curto; legado retorna `null`                                            |
| `src/lib/trello/client.ts`                             | Substituir contagem por lista (`countOpenCardsInList` no loop) por fetch board-wide + filtro por label |
| `src/lib/scheduling/get-delivery-date-availability.ts` | Passar `labelIdEntregar` na contagem                                                                   |
| Testes do client / availability                        | Contar só cards com a label; ignorar cards sem label                                                   |
| Docs de deploy / spec 2026-06-03                       | Nota de migração do board (renomear colunas) se necessário                                             |

**Sem mudança:** `DeliveryDateField`, route HTTP, env vars novas, `maxDeliveriesPerDay`, pending Supabase.

---

## 7. Migração operacional do board

1. Renomear colunas de data para `DIA - DD/MM` (curto).
2. Garantir que cards de entrega real tenham a label Entregar (`TRELLO_LABEL_ID_ENTREGAR`).
3. Cards de organização (entregador/rota) **sem** essa label.

Até o passo 1, o site pode mostrar mais vagas do que o board (ocupação Trello = 0 nessas colunas).

---

## 8. Fora de escopo

- Contagem ou UI de retirada.
- Mudança de limite diário ou regras de antecedência/horizonte.
- Alteração do modal de checkout / contrato JSON da API.
- Renomear funções (`buildEntregarListName`, etc.) — opcional em refactor futuro; comportamento muda, nomes podem permanecer nesta entrega.

---

## 9. Critérios de aceite

- [ ] Coluna `QUARTA - 05/08` com 3 cards de organização + 2 cards com label Entregar → ocupação Trello = 2.
- [ ] Coluna `ENTREGAR - QUARTA-FEIRA - 05/08` → ignorada na disponibilidade.
- [ ] Pós-pagamento cria/usa coluna no formato curto e aplica label Entregar no card.
- [ ] Select de datas e `GET /api/availability/delivery-dates` mantêm o mesmo shape de resposta.
- [ ] Testes unitários cobrem parse/build curto e filtro por label.
