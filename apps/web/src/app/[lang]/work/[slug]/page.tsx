import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { dictionaries, isLang, type Lang } from "@/lib/i18n";
import { caseStudies } from "@/lib/caseStudies";
import { pageMetadata } from "@/lib/seo";
import { CaseStudyScreen } from "@/components/screens/CaseStudyScreen";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const l: Lang = isLang(lang) ? lang : "it";
  const project = dictionaries[l].work.items.find((p) => p.slug === slug);
  if (!project) return {};
  return pageMetadata(l, `/work/${slug}`, {
    title: project.title,
    description: project.blurb,
  });
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const l: Lang = isLang(lang) ? lang : "it";
  const project = dictionaries[l].work.items.find((p) => p.slug === slug);

  // 404 (not a blank page) if the project or its case-study content is missing.
  if (!project || !caseStudies[l][slug]) notFound();

  return (
    <>
      <CaseStudyScreen slug={slug} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: `/${l}` },
          { name: dictionaries[l].nav.items[0].label, path: `/${l}/work` },
          { name: project.title, path: `/${l}/work/${slug}` },
        ])}
      />
    </>
  );
}
