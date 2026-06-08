import { site } from "@/lib/content";
import { dictionaries, type Lang } from "@/lib/i18n";

/* schema.org JSON-LD factories. Generated in the primary language (Italian)
   for indexing/GEO; rendered server-side via <JsonLd>. */

const baseUrl = `https://${site.domain}`;

export function organizationLd(lang: Lang) {
  const d = dictionaries[lang];
  const knowsAbout = d.pillars.items.flatMap((p) => [
    p.title,
    ...p.services.map((s) => s.title),
  ]);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    description: d.brand.description,
    email: site.email,
    areaServed: "Worldwide",
    knowsAbout,
    sameAs: site.social.map((s) => s.href),
  };
}

export function websiteLd(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: baseUrl,
    inLanguage: lang,
    publisher: { "@type": "Organization", name: site.name, url: baseUrl },
  };
}

export function servicesLd(lang: Lang) {
  const d = dictionaries[lang];
  return {
    "@context": "https://schema.org",
    "@graph": d.pillars.items.map((p) => ({
      "@type": "Service",
      name: p.title,
      description: p.summary,
      serviceType: p.services.map((s) => s.title).join(", "),
      provider: { "@type": "Organization", name: site.name, url: baseUrl },
      areaServed: "Worldwide",
    })),
  };
}

export function faqLd(lang: Lang) {
  const d = dictionaries[lang];
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: d.faq.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${baseUrl}${it.path}`,
    })),
  };
}
