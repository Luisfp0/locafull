import {
  buildEntregarListName,
  parseEntregarListDate,
  parseIsoDateLocal,
} from "@/lib/scheduling/list-name";

import { createTrelloList, fetchTrelloLists } from "./client";
import type { TrelloConfig } from "./types";

export async function findOrCreateEntregarList(
  isoDate: string,
  config: TrelloConfig,
): Promise<{ listId: string } | { error: string }> {
  const date = parseIsoDateLocal(isoDate);
  const year = date.getFullYear();
  const lists = await fetchTrelloLists(config.boardId, config);

  if ("error" in lists) {
    return lists;
  }

  const expectedName = buildEntregarListName(date);
  const existing = lists.find((list) => {
    const parsed = parseEntregarListDate(list.name, year);
    return parsed === isoDate || list.name === expectedName;
  });

  if (existing) {
    return { listId: existing.id };
  }

  const created = await createTrelloList(config.boardId, expectedName, config);

  if ("error" in created) {
    return created;
  }

  return { listId: created.id };
}
