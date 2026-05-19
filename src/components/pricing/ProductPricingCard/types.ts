import type { PricingProduct } from "../types";

export type ProductPricingCardProps = {
  product: PricingProduct;
};

export type ProductCombosProps = {
  product: PricingProduct;
};

export type ProductCtaProps = {
  product: PricingProduct;
  defaultPlanId?: string;
};
