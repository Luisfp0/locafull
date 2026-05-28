import type { AbacateWebhookEvent } from "@/lib/abacatepay/types";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createTrelloCardForOrder } from "@/lib/trello/create-order-card";

import type { OrderInsertRow } from "./types";
import { parseConfirmedOrderFromWebhook } from "./webhook-utils";

export async function confirmOrderFromWebhook(
  event: AbacateWebhookEvent,
): Promise<{ confirmed: boolean } | { error: string }> {
  const parsed = parseConfirmedOrderFromWebhook(event);

  if (!parsed.success) {
    if (parsed.ignored) {
      return { confirmed: false };
    }
    return { error: parsed.error ?? "Webhook inválido." };
  }

  const supabase = getSupabaseAdmin();

  const { data: updated, error } = await supabase
    .from("orders")
    .update({ status: "paid", payment_id: parsed.paymentId })
    .eq("id", parsed.orderId)
    .eq("status", "pending")
    .select();

  if (error) {
    console.error("[orders] confirm update failed", {
      orderId: parsed.orderId,
      error,
    });
    return { error: "Falha ao confirmar pedido." };
  }

  if (!updated || updated.length === 0) {
    // Já confirmado por outro webhook (idempotência) ou pedido inexistente.
    return { confirmed: false };
  }

  const row = updated[0] as OrderInsertRow;
  const trelloResult = await createTrelloCardForOrder(row);

  if ("error" in trelloResult) {
    console.error("[trello] card create failed", {
      orderId: row.id,
      error: trelloResult.error,
    });
  } else if (trelloResult.created) {
    console.info("[trello] card created", {
      orderId: row.id,
      cardId: trelloResult.cardId,
    });
  }

  return { confirmed: true };
}
