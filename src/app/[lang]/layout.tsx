import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { isLang, isTheme, type Theme } from "@/lib/i18n";
import { AppProviders } from "@/components/providers/AppProviders";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationLd, websiteLd } from "@/lib/structuredData";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const cookieTheme = (await cookies()).get("theme")?.value;
  const theme: Theme = isTheme(cookieTheme) ? cookieTheme : "dark";

  return (
    <AppProviders initialLang={lang} initialTheme={theme}>
      <SmoothScroll>
        <ScrollProgress />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </SmoothScroll>
      <CustomCursor />
      <JsonLd data={organizationLd(lang)} />
      <JsonLd data={websiteLd(lang)} />
    </AppProviders>
  );
}
