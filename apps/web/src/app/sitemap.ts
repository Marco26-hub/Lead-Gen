import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { dictionaries, LANGS } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${site.domain}`;
  const routes = [
    "",
    "/work",
    "/services",
    "/about",
    "/contact",
    ...dictionaries.en.work.items.map((p) => `/work/${p.slug}`),
  ];

  const entries: MetadataRoute.Sitemap = routes.flatMap((route) =>
    LANGS.map((lang) => ({
      url: `${base}/${lang}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: route === "" ? 1 : route.startsWith("/work/") ? 0.6 : 0.8,
      alternates: {
        languages: {
          it: `${base}/it${route}`,
          en: `${base}/en${route}`,
        },
      },
    })),
  );

  return entries;
}
