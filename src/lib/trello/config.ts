import { MAX_DELIVERIES_PER_DAY } from "@/lib/scheduling/constants";

import type { TrelloConfig } from "./types";

function readMaxDeliveriesPerDay(): number {
  const raw = process.env.TRELLO_MAX_DELIVERIES_PER_DAY?.trim();
  const parsed = raw ? Number(raw) : MAX_DELIVERIES_PER_DAY;

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : MAX_DELIVERIES_PER_DAY;
}

export function getTrelloConfig(): TrelloConfig | null {
  const apiKey = process.env.TRELLO_API_KEY?.trim();
  const token = process.env.TRELLO_TOKEN?.trim();
  const boardId = process.env.TRELLO_BOARD_ID?.trim();
  const labelIdEntregar = process.env.TRELLO_LABEL_ID_ENTREGAR?.trim();
  const listIdFallback = process.env.TRELLO_LIST_ID_A_AGENDAR?.trim();

  if (!apiKey || !token || !boardId || !labelIdEntregar) {
    return null;
  }

  return {
    apiKey,
    token,
    boardId,
    labelIdEntregar,
    maxDeliveriesPerDay: readMaxDeliveriesPerDay(),
    listIdFallback: listIdFallback || undefined,
  };
}
