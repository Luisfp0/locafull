import { ROUTES } from "@/lib/routes";

import { PRICING_PRODUCTS } from "./constants";

export function buildOrderHref(productId: string, planId: string): string {
  const params = new URLSearchParams({ product: productId, plan: planId });
  return `${ROUTES.pricing}?${params.toString()}`;
}

export function findPricingProduct(productId: string) {
  return PRICING_PRODUCTS.find((product) => product.id === productId);
}

export function findPricingPlanLabel(
  productId: string,
  planId: string,
): string | undefined {
  const product = findPricingProduct(productId);
  if (!product) return undefined;

  const plan = product.plans.find((item) => item.id === planId);
  if (plan) return plan.label;

  const combo = product.combos?.find((item) => item.id === planId);
  return combo?.label;
}

export function findPricingPlanPrice(
  productId: string,
  planId: string,
): number | undefined {
  const product = findPricingProduct(productId);
  if (!product) return undefined;

  const plan = product.plans.find((item) => item.id === planId);
  if (plan) return plan.priceCents;

  const combo = product.combos?.find((item) => item.id === planId);
  return combo?.priceCents;
}

export function buildPricingLineItemName(
  productId: string,
  planId: string,
): string | undefined {
  const product = findPricingProduct(productId);
  const planLabel = findPricingPlanLabel(productId, planId);

  if (!product || !planLabel) return undefined;

  return `${product.name} — ${planLabel}`;
}

export function findAbacateProductId(
  productId: string,
  planId: string,
): string | undefined {
  const product = findPricingProduct(productId);
  if (!product) return undefined;

  const plan = product.plans.find((item) => item.id === planId);
  if (plan?.abacateProductId) return plan.abacateProductId;

  const combo = product.combos?.find((item) => item.id === planId);
  return combo?.abacateProductId;
}
