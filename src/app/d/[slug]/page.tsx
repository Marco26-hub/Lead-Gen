import { notFound } from "next/navigation";
import { buildLocalBusinessJsonLd, env, getServiceClient, PageModelSchema, type LeadStatus, type OpeningHoursEntry, type PageModel } from "@maps/core";
import { DemoPage } from "@/leadgen/components/demo/DemoPage";
import { BuyerBanner } from "@/leadgen/components/demo/BuyerBanner";

// ISR: render on demand, cache for an hour.
export const revalidate = 3600;

interface DemoData {
  model: PageModel;
  name: string;
  rating: number | null;
  reviewCount: number | null;
  template: string | null;
  photos: string[];
  openingHours: OpeningHoursEntry[] | null;
  /** Stato lifecycle — il BuyerBanner appare solo se il lead non è già pagante o uscito. */
  status: LeadStatus;
}

/**
 * Lifecycle states in cui il prospect è ancora "in vendita" → banner visibile.
 *
 * `trialing` deliberatamente ESCLUSO: in trial il cliente è già a bordo, vedere
 * "Vuoi attivarla?" sotto la sua demo è UX confusa. Il banner ricomparirà solo
 * se il trial scade senza conversione e il lead torna a uno stato pre-trial.
 */
const BANNER_STATES: ReadonlySet<LeadStatus> = new Set<LeadStatus>([
  "generated", "deployed", "approved", "contacted", "replied",
]);

async function getDemoModel(slug: string): Promise<DemoData | null> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("leads")
    .select("page_model, business_name, rating, review_count, template, photos, opening_hours, status")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data?.page_model) return null;
  const parsed = PageModelSchema.safeParse(data.page_model);
  if (!parsed.success) return null;
  return {
    model: parsed.data,
    name: data.business_name as string,
    rating: (data.rating as number | null) ?? null,
    reviewCount: (data.review_count as number | null) ?? null,
    template: (data.template as string | null) ?? null,
    photos: Array.isArray(data.photos) ? (data.photos as string[]) : [],
    openingHours: (data.opening_hours as OpeningHoursEntry[] | null) ?? null,
    status: (data.status as LeadStatus) ?? "scraped",
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = await getDemoModel(slug);
  if (!demo) return { title: "Demo" };
  const title = `${demo.name} — Anteprima sito`;
  const description = demo.model.meta.tagline;
  const ogImage = `${env.PUBLIC_BASE_URL}/api/og/${slug}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${env.PUBLIC_BASE_URL}/d/${slug}`,
      siteName: "Social Web Automation",
      locale: "it_IT",
      images: [{ url: ogImage, width: 1200, height: 630, alt: demo.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function DemoRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = await getDemoModel(slug);
  if (!demo) notFound();
  const jsonLd = buildLocalBusinessJsonLd({
    model: demo.model,
    rating: demo.rating,
    reviewCount: demo.reviewCount,
    photos: demo.photos,
    url: `${env.PUBLIC_BASE_URL}/d/${slug}`,
  });
  const showBanner = BANNER_STATES.has(demo.status);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {showBanner && (
        <BuyerBanner
          businessName={demo.name}
          calendlyUrl={env.SALES_CALENDLY_URL}
          salesWhatsapp={env.SALES_WHATSAPP}
          salesEmail={env.SALES_EMAIL}
        />
      )}
      <DemoPage
        model={demo.model}
        rating={demo.rating}
        reviewCount={demo.reviewCount}
        template={demo.template}
        photos={demo.photos}
        openingHours={demo.openingHours}
      />
    </>
  );
}
