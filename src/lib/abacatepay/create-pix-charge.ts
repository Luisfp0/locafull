import { abacatePost } from "./client";
import type { CreatePixChargeInput, PixCharge } from "./types";

type PixChargeResponse = {
  id?: string;
  brCode?: string;
  brCodeBase64?: string;
  expiresAt?: string;
  status?: string;
};

export async function createPixCharge(
  input: CreatePixChargeInput,
): Promise<{ charge: PixCharge } | { error: string }> {
  const result = await abacatePost<PixChargeResponse>("/transparents/create", {
    method: "PIX",
    data: {
      amount: input.amountCents,
      description: input.description,
      expiresIn: 3600,
      externalId: input.externalId,
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        cellphone: input.customer.cellphone,
      },
      metadata: { orderId: input.externalId },
    },
  });

  if ("error" in result) {
    return result;
  }

  const { id, brCode, brCodeBase64, expiresAt, status } = result.data;

  if (!id || !brCode || !brCodeBase64) {
    return { error: "Resposta Pix incompleta da AbacatePay." };
  }

  return {
    charge: {
      id,
      brCode,
      brCodeBase64,
      expiresAt: expiresAt ?? null,
      status: status ?? "PENDING",
    },
  };
}
