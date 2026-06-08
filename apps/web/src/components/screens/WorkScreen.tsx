"use client";

import { useI18n } from "@/components/providers/AppProviders";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Stats } from "@/components/sections/Stats";
import { cn } from "@/lib/utils";

export function WorkScreen() {
  const { t } = useI18n();

  return (
    <>
      <PageHeader
        eyebrow={t.work.headerEyebrow}
        title={t.work.headerTitle}
        description={t.work.headerDesc}
        meta={
          <div className="flex flex-wrap gap-x-10 gap-y-4 font-mono text-xs text-faint">
            {t.work.meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        }
      />

      <section className="shell pb-28 md:pb-36">
        <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
          {t.work.items.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={i}
              className={cn(i % 2 === 1 && "md:mt-24")}
            />
          ))}
        </div>
      </section>

      <Stats />
    </>
  );
}
