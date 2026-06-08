import type { Metadata } from "next";
import { dictionaries, isLang, type Lang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ServicesScreen } from "@/components/screens/ServicesScreen";
import { JsonLd } from "@/components/seo/JsonLd";
import { servicesLd, faqLd, breadcrumbLd } from "@/lib/structuredData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "it";
  const d = dictionaries[l];
  return pageMetadata(l, "/services", {
    title: d.services.headerEyebrow,
    description: d.services.headerDesc,
  });
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "it";

  return (
    <>
      <ServicesScreen />
      <JsonLd data={servicesLd(l)} />
      <JsonLd data={faqLd(l)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: `/${l}` },
          { name: dictionaries[l].services.headerEyebrow, path: `/${l}/services` },
        ])}
      />
    </>
  );
}
