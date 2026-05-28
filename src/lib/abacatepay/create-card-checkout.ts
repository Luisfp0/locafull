import { abacatePost } from "./client";
import type { CardCheckout, CreateCardCheckoutInput } from "./types";

type CardCheckoutResponse = {
  id?: string;
  url?: string;
};

export async function createCardCheckout(
  input: CreateCardCheckoutInput,
): Promise<{ checkout: CardCheckout } | { error: string }> {
  const result = await abacatePost<CardCheckoutResponse>("/checkouts/create", {
    items: [{ id: input.abacateProductId, quantity: 1 }],
    methods: ["CARD"],
    externalId: input.externalId,
    completionUrl: input.completionUrl,
    returnUrl: input.returnUrl,
    metadata: { orderId: input.externalId },
  });

  if ("error" in result) {
    return result;
  }

  const { id, url } = result.data;

  if (!id || !url) {
    return { error: "Resposta de checkout incompleta da AbacatePay." };
  }

  return { checkout: { id, url } };
}
