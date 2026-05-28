import type { AbacateWebhookEvent } from "@/lib/abacatepay/types";

const CONFIRM_EVENTS = ["transparent.completed", "checkout.completed"];

export type ParsedWebhookOrder =
  | { success: true; orderId: string; paymentId: string }
  | { success: false; ignored: boolean; error?: string };

export function parseConfirmedOrderFromWebhook(
  event: AbacateWebhookEvent,
): ParsedWebhookOrder {
  if (!event.event || !CONFIRM_EVENTS.includes(event.event)) {
    return { success: false, ignored: true };
  }

  const entity = event.data?.transparent ?? event.data?.checkout;
  const orderId = entity?.externalId?.trim();
  const paymentId = entity?.id?.trim();

  if (!orderId || !paymentId) {
    return {
      success: false,
      ignored: false,
      error: "Webhook sem externalId/id.",
    };
  }

  return { success: true, orderId, paymentId };
}
