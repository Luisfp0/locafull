import { randomUUID } from "node:crypto";

import { formatDeliveryAddress } from "@/components/order/utils";
import type { OrderCheckoutPayload } from "@/components/order/types";
import { getSupabaseAdmin } from "@/lib/supabase";

import type { OrderInsertRow, OrderPaymentMethod } from "./types";

export async function insertPendingOrder(input: {
  payload: OrderCheckoutPayload;
  amountCents: number;
  paymentMethod: OrderPaymentMethod;
}): Promise<{ orderId: string } | { error: string }> {
  const orderId = randomUUID();
  const { payload } = input;

  const row: OrderInsertRow = {
    id: orderId,
    payment_provider: "abacatepay",
    payment_method: input.paymentMethod,
    payment_id: null,
    status: "pending",
    product_id: payload.productId,
    plan_id: payload.planId,
    amount_cents: input.amountCents,
    customer_name: payload.name,
    customer_email: payload.email,
    customer_phone: payload.phone,
    postal_code: payload.postalCode,
    street: payload.street,
    number: payload.number,
    complement: payload.complement ?? null,
    neighborhood: payload.neighborhood,
    city: payload.city,
    notes: payload.notes ?? null,
    delivery_address: formatDeliveryAddress(payload),
    scheduled_date: payload.scheduledDate,
  };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("orders").insert(row);

  if (error) {
    console.error("[orders] pending insert failed", error);
    return { error: "Não foi possível registrar o pedido." };
  }

  return { orderId };
}
