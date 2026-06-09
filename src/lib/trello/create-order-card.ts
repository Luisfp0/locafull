import type { OrderInsertRow } from "@/lib/orders/types";

import { buildTrelloCardFromOrder } from "./build-card";
import { getTrelloConfig } from "./config";
import { findOrCreateEntregarList } from "./find-or-create-entregar-list";
import type { CreateTrelloCardResult } from "./types";

export async function createTrelloCardForOrder(
  row: OrderInsertRow,
): Promise<CreateTrelloCardResult> {
  const config = getTrelloConfig();

  if (!config) {
    console.warn("[trello] skipped — env vars not configured");
    return { created: false, skipped: true };
  }

  const { name, desc } = buildTrelloCardFromOrder(row);

  let listId = config.listIdFallback;

  if (row.scheduled_date) {
    const resolved = await findOrCreateEntregarList(row.scheduled_date, config);

    if ("error" in resolved) {
      return { error: resolved.error };
    }

    listId = resolved.listId;
  }

  if (!listId) {
    return { error: "Lista de destino do Trello não configurada." };
  }

  const params = new URLSearchParams({
    key: config.apiKey,
    token: config.token,
    idList: listId,
    name,
    desc,
    idLabels: config.labelIdEntregar,
  });

  try {
    const response = await fetch(`https://api.trello.com/1/cards?${params}`, {
      method: "POST",
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        error: `Trello API ${response.status}: ${body.slice(0, 200)}`,
      };
    }

    const data = (await response.json()) as { id?: string };

    if (!data.id) {
      return { error: "Trello API não retornou id do card." };
    }

    return { created: true, cardId: data.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro de rede ao chamar Trello.";
    return { error: message };
  }
}
