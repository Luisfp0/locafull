export const SITE_NAME = "Locafull";
export const SITE_TAGLINE = "Agilidade que movimenta sua obra";
export const SITE_DESCRIPTION =
  "Locação de mini caçambas, tambores e barris para sua obra em Goiânia e região.";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "556230300077";
export const WHATSAPP_DISPLAY = "(62) 3030-0077";
export const PHONE_DISPLAY = "(62) 3030-0077";
export const EMAIL = "contato@locafull.com.br";
export const ADDRESS = "Goiânia e região metropolitana — GO";

export const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
  "https://www.instagram.com/locafull_locacoes/";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const NAV_LINKS = [
  { label: "Sobre nós", href: "/sobre" },
  { label: "O que fazemos", href: "/servicos" },
  { label: "Diferenciais", href: "/diferenciais" },
  { label: "Contato", href: "/contato" },
] as const;
