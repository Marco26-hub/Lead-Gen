"use client";

import { useI18n } from "@/components/providers/AppProviders";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServicesBento } from "@/components/sections/ServicesBento";
import { FAQ } from "@/components/sections/FAQ";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { Stats } from "@/components/sections/Stats";

export function ServicesScreen() {
  const { t } = useI18n();

  return (
    <>
      <PageHeader
        eyebrow={t.services.headerEyebrow}
        title={t.services.headerTitle}
        description={t.services.headerDesc}
      />
      <ServicesBento />
      <ProcessSection />
      <FAQ />
      <Stats />
    </>
  );
}
