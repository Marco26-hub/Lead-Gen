import type { Metadata } from "next";
import { dictionaries, isLang, type Lang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { WorkScreen } from "@/components/screens/WorkScreen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "it";
  const d = dictionaries[l];
  return pageMetadata(l, "/work", {
    title: d.nav.items[0].label,
    description: d.work.headerDesc,
  });
}

export default function WorkPage() {
  return <WorkScreen />;
}
