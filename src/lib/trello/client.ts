import { parseEntregarListDate } from "@/lib/scheduling/list-name";

import type { TrelloConfig } from "./types";

type TrelloList = {
  id: string;
  name: string;
};

type TrelloCardSummary = {
  id: string;
  idList: string;
  idLabels: string[];
};

const boardIdCache = new Map<string, string>();

function buildAuthParams(config: Pick<TrelloConfig, "apiKey" | "token">) {
  return new URLSearchParams({
    key: config.apiKey,
    token: config.token,
  });
}

export async function resolveTrelloBoardId(
  boardIdOrShortLink: string,
  config: Pick<TrelloConfig, "apiKey" | "token">,
): Promise<string | { error: string }> {
  const cached = boardIdCache.get(boardIdOrShortLink);

  if (cached) {
    return cached;
  }

  if (/^[a-f0-9]{24}$/i.test(boardIdOrShortLink)) {
    boardIdCache.set(boardIdOrShortLink, boardIdOrShortLink);
    return boardIdOrShortLink;
  }

  const params = buildAuthParams(config);
  params.set("fields", "id");

  try {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardIdOrShortLink}?${params}`,
    );

    if (!response.ok) {
      return { error: `Trello API ${response.status}` };
    }

    const data = (await response.json()) as { id?: string };

    if (!data.id) {
      return { error: "Trello API não retornou id do board." };
    }

    boardIdCache.set(boardIdOrShortLink, data.id);
    return data.id;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro de rede ao chamar Trello.";
    return { error: message };
  }
}

export async function fetchTrelloLists(
  boardId: string,
  config: Pick<TrelloConfig, "apiKey" | "token">,
): Promise<TrelloList[] | { error: string }> {
  const params = buildAuthParams(config);

  try {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}/lists?${params}`,
    );

    if (!response.ok) {
      return { error: `Trello API ${response.status}` };
    }

    return (await response.json()) as TrelloList[];
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro de rede ao chamar Trello.";
    return { error: message };
  }
}

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

export async function createTrelloList(
  boardId: string,
  name: string,
  config: Pick<TrelloConfig, "apiKey" | "token">,
): Promise<{ id: string } | { error: string }> {
  const resolvedBoardId = await resolveTrelloBoardId(boardId, config);

  if (typeof resolvedBoardId === "object") {
    return resolvedBoardId;
  }

  const params = buildAuthParams(config);
  params.set("idBoard", resolvedBoardId);
  params.set("name", name);
  params.set("pos", "bottom");

  try {
    const response = await fetch(`https://api.trello.com/1/lists?${params}`, {
      method: "POST",
    });

    if (!response.ok) {
      return { error: `Trello API ${response.status}` };
    }

    const data = (await response.json()) as { id?: string };

    if (!data.id) {
      return { error: "Trello API não retornou id da lista." };
    }

    return { id: data.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro de rede ao chamar Trello.";
    return { error: message };
  }
}

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
