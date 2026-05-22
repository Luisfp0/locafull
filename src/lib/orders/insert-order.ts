import type Stripe from "stripe";

import { createTrelloCardForOrder } from "@/lib/trello/create-order-card";
import { getSupabaseAdmin } from "@/lib/supabase";

import {
  buildOrderRowFromCheckoutSession,
  isDuplicateOrderError,
} from "./utils";

export async function insertOrderFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<{ inserted: boolean } | { error: string }> {
  const parsed = buildOrderRowFromCheckoutSession(session);

  if (!parsed.success) {
    return { error: parsed.error };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("orders").insert(parsed.row);

  if (!error) {
    const trelloResult = await createTrelloCardForOrder(parsed.row);

    if ("error" in trelloResult) {
      console.error("[trello] card create failed", {
        stripeSessionId: parsed.row.stripe_session_id,
        error: trelloResult.error,
      });
    } else if (trelloResult.created) {
      console.info("[trello] card created", {
        stripeSessionId: parsed.row.stripe_session_id,
        cardId: trelloResult.cardId,
      });
    }

    return { inserted: true };
  }

  if (isDuplicateOrderError(error)) {
    return { inserted: false };
  }

  console.error("[orders] insert failed", error);
  return { error: "Não foi possível salvar o pedido." };
}
