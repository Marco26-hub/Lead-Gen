import type { Metadata } from "next";
import { dictionaries, isLang, type Lang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ContactScreen } from "@/components/screens/ContactScreen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "it";
  const d = dictionaries[l];
  return pageMetadata(l, "/contact", {
    title: d.nav.items[3].label,
    description: d.contact.headerDesc,
  });
}

export default function ContactPage() {
  return <ContactScreen />;
}
