const DEFAULT_PAYMENT_METHODS = ["card"] as const;

type StripePaymentMethodType = "card" | "pix";

export function getStripePaymentMethodTypes(): StripePaymentMethodType[] {
  const raw = process.env.STRIPE_PAYMENT_METHODS?.trim();

  if (!raw) {
    return [...DEFAULT_PAYMENT_METHODS];
  }

  return raw
    .split(",")
    .map((method) => method.trim())
    .filter(Boolean) as StripePaymentMethodType[];
}
