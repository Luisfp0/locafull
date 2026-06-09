# Locafull — Agendamento de entrega no checkout

**Data:** 2026-06-03  
**Status:** Aprovado  
**Escopo:** Campo de data de entrega no modal de checkout, disponibilidade via Trello + Supabase, card na coluna ENTREGAR do dia (criação automática de coluna).

---

## 1. Objetivo

Permitir que o cliente escolha uma **data de entrega** ao finalizar o pedido. O site exibe apenas dias com vaga, reserva a vaga enquanto o Pix está `pending`, e após pagamento cria o card do Trello na coluna **ENTREGAR** correspondente (criando a coluna se não existir).

---

## 2. Regras de negócio

| Regra               | Valor                                                        |
| ------------------- | ------------------------------------------------------------ |
| Limite diário       | 6 entregas                                                   |
| Antecedência mínima | 1 dia (não permite o mesmo dia)                              |
| Dias permitidos     | Segunda a sábado (domingo excluído)                          |
| Horizonte           | Próximos 30 dias                                             |
| Reserva             | Pedidos `pending` ocupam vaga; `expired`/`cancelled` liberam |
| Escopo Trello       | Apenas colunas **ENTREGAR** (RETIRAR permanece manual)       |
| Coluna inexistente  | Conta como 0 cards (6 vagas disponíveis)                     |
| Coluna nova         | Criada automaticamente após pagamento confirmado             |

---

## 3. Cálculo de disponibilidade

Para cada data candidata:

```
ocupado = cards_abertos_coluna_ENTREGAR + pedidos_pending_supabase_na_data
vagas   = 6 - ocupado
disponível se vagas > 0
```

- **Trello:** reflete entregas confirmadas e cards adicionados manualmente pela operação.
- **Supabase:** pedidos `pending` ainda não têm card no Trello — evita dupla contagem.
- **Revalidação:** ao criar pedido (`POST /api/abacatepay/orders`), recalcular antes de inserir.

Datas candidatas: amanhã até +30 dias, excluindo domingos.

---

## 4. Fluxo

```
Modal abre
  → GET /api/availability/delivery-dates
  → select com datas disponíveis

Cliente preenche formulário + data
  → POST /api/abacatepay/orders { …, scheduledDate: "2026-06-09" }
  → valida vaga → insert pending com scheduled_date

Pix/cartão confirmado (webhook)
  → confirm-order
  → findOrCreateEntregarList(date)
  → createTrelloCardForOrder na listId resolvida
  → card inclui data de entrega na descrição
```

---

## 5. Trello

### Nomenclatura de coluna

`ENTREGAR - TERÇA-FEIRA - 09/06`

- Dia da semana em português, maiúsculas, com hífen (padrão do board atual).
- Data `DD/MM` sem ano no título (ano inferido do contexto).

### Criação de coluna

1. Listar listas do board (`TRELLO_BOARD_ID`).
2. Buscar lista cujo nome corresponde ao padrão ENTREGAR + data.
3. Se não existir, `POST /1/lists` com `name` e `idBoard`.
4. Posição: final do board (`pos: bottom`).

### Card pós-pagamento

- `idList`: coluna ENTREGAR da data escolhida (não mais `TRELLO_LIST_ID_A_AGENDAR` como destino final).
- Label `TRELLO_LABEL_ID_ENTREGAR` mantida.
- Descrição inclui linha `Data de entrega: DD/MM/AAAA (DIA-DA-SEMANA)`.

`TRELLO_LIST_ID_A_AGENDAR` pode permanecer como fallback se `TRELLO_BOARD_ID` não estiver configurado.

---

## 6. API

### `GET /api/availability/delivery-dates`

Resposta:

```json
{
  "dates": [
    { "date": "2026-06-09", "label": "Terça, 09/06/2026", "slotsRemaining": 3 }
  ]
}
```

- Cache em memória 5 minutos (por instância serverless — aceitável para MVP).
- Erro Trello: retornar 502 com mensagem amigável; front exibe fallback WhatsApp.

---

## 7. Dados (Supabase)

Migration:

```sql
alter table public.orders
  add column if not exists scheduled_date date not null default current_date;
-- default temporário para linhas existentes; novos pedidos sempre informam a data
```

Índice: `(scheduled_date, status)` para contagem de pending.

---

## 8. UI

Campo **Data da entrega** \* entre Observações e Forma de pagamento:

- `<select>` populado pela API.
- Opção: `Terça, 09/06/2026 (3 vagas)`.
- Estados: loading, erro, lista vazia com mensagem + link WhatsApp.
- Obrigatório para submit.

---

## 9. Variáveis de ambiente

| Variável                        | Descrição                                                    |
| ------------------------------- | ------------------------------------------------------------ |
| `TRELLO_BOARD_ID`               | Board da operação                                            |
| `TRELLO_MAX_DELIVERIES_PER_DAY` | Default `6`                                                  |
| Existentes                      | `TRELLO_API_KEY`, `TRELLO_TOKEN`, `TRELLO_LABEL_ID_ENTREGAR` |

---

## 10. Erros e edge cases

| Situação                                   | Comportamento                                             |
| ------------------------------------------ | --------------------------------------------------------- |
| Vaga esgotou entre abrir modal e submit    | 400 "Data indisponível, escolha outra."                   |
| Trello indisponível na leitura             | Modal exibe erro; não bloqueia resto do site              |
| Trello falha ao criar card pós-pagamento   | Pedido `paid` no Supabase; log; card manual               |
| Dois pagamentos simultâneos na última vaga | Revalidação no insert reduz risco; aceitar risco residual |
| Coluna duplicada (race)                    | Re-buscar listas antes de criar                           |

---

## 11. Fora do escopo

- Agendamento de RETIRAR
- Remarcação pelo cliente
- Bloqueio de feriados via admin
- Sincronização bidirecional Trello → Supabase além da contagem de cards

---

## 12. Testes

- Unit: parse de nome de coluna ENTREGAR, cálculo de vagas, geração de datas seg–sáb.
- Unit: validação de `scheduledDate` no payload.
- Integração (mock fetch): findOrCreateEntregarList idempotente.
