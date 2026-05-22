import type { OrderInsertRow } from "@/lib/orders/types";

import { buildTrelloCardFromOrder } from "./build-card";
import { getTrelloConfig } from "./config";
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

  const params = new URLSearchParams({
    key: config.apiKey,
    token: config.token,
    idList: config.listId,
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
