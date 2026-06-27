import { ROUTES } from "@/lib/routes";

export { ROUTES } from "@/lib/routes";

export const SITE_NAME = "Locafull";
export const SITE_DESCRIPTION =
  "Locação de mini caçambas, tambores e barris para sua obra em Goiânia e região.";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "556230300077";

export const WHATSAPP_DISPLAY = "(62) 3030-0077";
export const PHONE_DISPLAY = "(62) 3030-0077";
export const EMAIL = "contato@locafull.com.br";
export const ADDRESS = "Goiânia e região metropolitana";

export const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
  "https://www.instagram.com/locafull_locacoes/";

const siteUrlFromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

export const SITE_URL =
  siteUrlFromEnv && siteUrlFromEnv.length > 0
    ? siteUrlFromEnv
    : (vercelUrl ?? "http://localhost:3000");

export const NAV_LINKS = [
  { label: "Home", href: ROUTES.home },
  { label: "Valores", href: ROUTES.pricing },
] as const;
