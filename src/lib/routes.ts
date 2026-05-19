export const ROUTES = {
  home: "/",
  about: "/about",
  pricing: "/pricing",
  differentials: "/differentials",
  contact: "/contact",
  order: "/order",
  checkout: "/checkout",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
