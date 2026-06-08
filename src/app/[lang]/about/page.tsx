import type { Metadata } from "next";
import { dictionaries, isLang, type Lang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { AboutScreen } from "@/components/screens/AboutScreen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "it";
  const d = dictionaries[l];
  return pageMetadata(l, "/about", {
    title: d.nav.items[2].label,
    description: d.about.headerDesc,
  });
}

export default function AboutPage() {
  return <AboutScreen />;
}
