export const ROUTES = {
  home: "/",
  pricing: "/pricing",
  checkout: "/checkout",
  checkoutSuccess: "/checkout/success",
  checkoutCancel: "/checkout/cancel",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
