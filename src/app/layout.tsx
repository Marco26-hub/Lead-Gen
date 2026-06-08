import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { site } from "@/lib/content";
import { dictionaries, isTheme } from "@/lib/i18n";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

// Locale comes from the middleware header and theme from a cookie, both
// request-time — render dynamically so <html lang> and theme are correct.
export const dynamic = "force-dynamic";

// Italian is the primary/canonical language; per-page generateMetadata adds
// localized titles + hreflang alternates.
const brand = dictionaries.it.brand;

export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  title: {
    default: `${site.name} — ${brand.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: brand.description,
  keywords: [
    "automazioni AI",
    "AI automation agency",
    "segretaria AI 24/7",
    "AI receptionist",
    "centralino AI",
    "prenotazione appuntamenti AI",
    "voice agent",
    "agenzia siti web",
    "e-commerce AI",
    "sistemi multi-agente",
    "SEO GEO",
    "lead generation",
    "automazione social",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    title: `${site.name} — ${brand.tagline}`,
    description: brand.description,
    siteName: site.name,
    locale: "it_IT",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${brand.tagline}`,
    description: brand.description,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#04060c" },
    { media: "(prefers-color-scheme: light)", color: "#f5f7fc" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const xLocale = (await headers()).get("x-locale");
  const lang = xLocale === "en" ? "en" : "it";
  const cookieTheme = (await cookies()).get("theme")?.value;
  const theme = isTheme(cookieTheme) ? cookieTheme : "dark";

  return (
    <html
      lang={lang}
      className={`${GeistSans.variable} ${GeistMono.variable} ${
        instrumentSerif.variable
      }${theme === "light" ? " light" : ""}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
