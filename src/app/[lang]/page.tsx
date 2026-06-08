import type { Metadata } from "next";
import { dictionaries, isLang, type Lang } from "@/lib/i18n";
import { site } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/hero/Hero";
import { ClientsStrip } from "@/components/sections/ClientsStrip";
import { Manifesto } from "@/components/sections/Manifesto";
import { ChaosToOrder } from "@/components/scroll/ChaosToOrder";
import { CapabilitiesOrbit } from "@/components/sections/CapabilitiesOrbit";
import { WorkShowcase } from "@/components/sections/WorkShowcase";
import { ParticleSection } from "@/components/sections/ParticleSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { FAQ } from "@/components/sections/FAQ";
import { Stats } from "@/components/sections/Stats";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqLd } from "@/lib/structuredData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "it";
  const d = dictionaries[l];
  return pageMetadata(l, "/", {
    absoluteTitle: `${site.name} — ${d.brand.tagline}`,
    description: d.brand.description,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "it";

  return (
    <>
      <Hero />
      <ClientsStrip />
      <Manifesto />
      <ChaosToOrder />
      <CapabilitiesOrbit />
      <WorkShowcase />
      <ParticleSection />
      <ProcessSection />
      <FAQ />
      <Stats />
      <JsonLd data={faqLd(l)} />
    </>
  );
}
