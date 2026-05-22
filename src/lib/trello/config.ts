import type { TrelloConfig } from "./types";

export function getTrelloConfig(): TrelloConfig | null {
  const apiKey = process.env.TRELLO_API_KEY?.trim();
  const token = process.env.TRELLO_TOKEN?.trim();
  const listId = process.env.TRELLO_LIST_ID_A_AGENDAR?.trim();
  const labelIdEntregar = process.env.TRELLO_LABEL_ID_ENTREGAR?.trim();

  if (!apiKey || !token || !listId || !labelIdEntregar) {
    return null;
  }

  return { apiKey, token, listId, labelIdEntregar };
}
