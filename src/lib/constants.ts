import { ROUTES } from "@/lib/routes";

export { ROUTES } from "@/lib/routes";

export const SITE_NAME = "Locafull";
export const SITE_TAGLINE = "Agilidade que movimenta sua obra";
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

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const NAV_LINKS = [
  { label: "Sobre nós", href: ROUTES.about },
  { label: "O que fazemos", href: ROUTES.services },
  { label: "Diferenciais", href: ROUTES.differentials },
] as const;

export const WHAT_WE_DO_DESCRIPTION =
  "Somos especialistas em locação de mini caçambas, tambores e barris para obras, reformas e limpeza de terrenos em Goiânia e região. Fazemos a entrega e a retirada no local, com agilidade e equipamentos ideais para espaços menores.";

export const WHAT_WE_DO_ITEMS = [
  {
    title: "Locação de mini caçambas",
    imageSrc: "/images/cacamba.jpeg",
    imageAlt: "Mini caçamba Locafull em corredor de obra com entulho",
  },
  {
    title: "Locação de tambores",
    imageSrc: "/images/tambor-reforma.jpg",
    imageAlt: "Tambor Locafull com rodízios em ambiente de reforma",
  },
  {
    title: "Locação de barris",
    imageSrc: "/images/barril.jpeg",
    imageAlt: "Tambor Locafull cheio de entulho de construção",
  },
] as const;
