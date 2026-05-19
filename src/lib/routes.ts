export const ROUTES = {
  home: "/",
  about: "/about",
  services: "/services",
  differentials: "/differentials",
  contact: "/contact",
  order: "/order",
  checkout: "/checkout",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
