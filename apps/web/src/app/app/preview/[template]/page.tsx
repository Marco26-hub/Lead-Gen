import { DemoPage } from "@/leadgen/components/demo/DemoPage";
import { seedFor } from "@/leadgen/components/demo/templates/_seed";

// Internal design-preview harness (behind Basic Auth). Renders a template with
// seed data so we can refine layouts without scraping or calling the LLM.
export const dynamic = "force-dynamic";

export const metadata = { title: "Anteprima template" };

export default async function PreviewRoute({ params }: { params: Promise<{ template: string }> }) {
  const { template } = await params;
  const seed = seedFor(template);
  return (
    <DemoPage
      template={template}
      model={seed.model}
      rating={seed.rating}
      reviewCount={seed.reviewCount}
      photos={seed.photos}
      openingHours={seed.openingHours}
    />
  );
}
