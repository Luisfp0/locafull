import type { OrderInsertRow } from "@/lib/orders/types";

export type TrelloConfig = {
  apiKey: string;
  token: string;
  boardId: string;
  labelIdEntregar: string;
  maxDeliveriesPerDay: number;
  listIdFallback?: string;
};

export type TrelloCardPayload = {
  name: string;
  desc: string;
};

export type CreateTrelloCardResult =
  | { created: true; cardId: string }
  | { created: false; skipped: true }
  | { error: string };

export type BuildTrelloCardInput = OrderInsertRow;
