import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";

const routes = [
  "",
  "/sobre",
  "/servicos",
  "/diferenciais",
  "/contato",
  "/pedido",
  "/checkout",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));
}
