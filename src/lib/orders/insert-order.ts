import type Stripe from "stripe";

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
    return { inserted: true };
  }

  if (isDuplicateOrderError(error)) {
    return { inserted: false };
  }

  console.error("[orders] insert failed", error);
  return { error: "Não foi possível salvar o pedido." };
}
