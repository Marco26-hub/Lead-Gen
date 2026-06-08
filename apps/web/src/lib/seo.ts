import type { Metadata } from "next";
import { site } from "@/lib/content";
import { LANGS, type Lang } from "@/lib/i18n";

const base = `https://${site.domain}`;

/** hreflang map for a logical path (Italian is x-default / primary). */
export function altLanguages(path: string): Record<string, string> {
  const clean = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  for (const l of LANGS) languages[l] = `${base}/${l}${clean}`;
  languages["x-default"] = `${base}/it${clean}`;
  return languages;
}

/** Per-page localized metadata with canonical + hreflang alternates. */
export function pageMetadata(
  lang: Lang,
  path: string,
  opts: { title?: string; description?: string; absoluteTitle?: string } = {},
): Metadata {
  const clean = path === "/" ? "" : path;
  const url = `${base}/${lang}${clean}`;
  return {
    title: opts.absoluteTitle ? { absolute: opts.absoluteTitle } : opts.title,
    description: opts.description,
    alternates: { canonical: url, languages: altLanguages(path) },
    openGraph: { url, locale: lang === "it" ? "it_IT" : "en_US" },
  };
}
