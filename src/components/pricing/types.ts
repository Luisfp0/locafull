export type PricingPlan = {
  id: string;
  label: string;
  priceCents: number;
  note?: string;
};

export type PricingCombo = {
  id: string;
  label: string;
  priceCents: number;
  description?: string;
};

export type PricingProduct = {
  id: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  capacity: string;
  plans: PricingPlan[];
  combos?: PricingCombo[];
  rules: string[];
  ctaLabel: string;
  orderEnabled: boolean;
};

export type PricingPageProps = {
  className?: string;
  productId?: string;
  planId?: string;
};
