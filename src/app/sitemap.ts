import type { MetadataRoute } from "next";

import { ROUTES, SITE_URL } from "@/lib/constants";

const paths = [
  ROUTES.home,
  ROUTES.about,
  ROUTES.services,
  ROUTES.differentials,
  ROUTES.contact,
  ROUTES.order,
  ROUTES.checkout,
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));
}
