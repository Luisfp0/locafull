export type CreatePixChargeInput = {
  amountCents: number;
  description: string;
  externalId: string;
};

export type PixCharge = {
  id: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string | null;
  status: string;
};

export type CreateCardCheckoutInput = {
  abacateProductId: string;
  externalId: string;
  completionUrl: string;
  returnUrl: string;
};

export type CardCheckout = {
  id: string;
  url: string;
};

type AbacateWebhookEntity = {
  id?: string;
  externalId?: string | null;
  status?: string;
  amount?: number;
  metadata?: { orderId?: string } | null;
};

export type AbacateWebhookEvent = {
  event?: string;
  data?: {
    transparent?: AbacateWebhookEntity;
    checkout?: AbacateWebhookEntity;
  };
};
