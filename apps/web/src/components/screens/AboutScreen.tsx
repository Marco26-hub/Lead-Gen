"use client";

import { useI18n } from "@/components/providers/AppProviders";
import { PageHeader } from "@/components/layout/PageHeader";
import { Manifesto } from "@/components/sections/Manifesto";
import { Stats } from "@/components/sections/Stats";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightTilt } from "@/components/ui/SpotlightTilt";

export function AboutScreen() {
  const { t } = useI18n();

  return (
    <>
      <PageHeader
        eyebrow={t.about.headerEyebrow}
        title={t.about.headerTitle}
        description={t.about.headerDesc}
      />

      <Manifesto />

      <section className="shell py-24 md:py-32">
        <SectionHeading
          eyebrow={t.about.principlesEyebrow}
          title={t.about.principlesTitle}
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line sm:grid-cols-2">
          {t.about.values.map((v, i) => (
            <Reveal
              key={v.title}
              delay={i * 0.06}
              className="bg-surface/40 p-8 md:p-10"
            >
              <div className="flex h-full flex-col">
                <span className="font-mono text-xs text-faint">0{i + 1}</span>
                <h3 className="mt-5 text-xl font-medium tracking-tight">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {v.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shell pb-28 md:pb-36">
        <SectionHeading
          eyebrow={t.about.peopleEyebrow}
          title={t.about.peopleTitle}
        />
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {t.about.team.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.06}>
              <div className="group">
                <SpotlightTilt
                  tilt={8}
                  className="grid aspect-square place-items-center rounded-2xl border border-line bg-gradient-to-br from-elevated to-surface"
                >
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <span className="relative z-10 font-serif text-5xl text-glow transition-transform duration-500 group-hover:scale-110">
                    {m.initials}
                  </span>
                </SpotlightTilt>
                <h3 className="mt-4 text-base font-medium">{m.name}</h3>
                <p className="text-sm text-muted">{m.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Stats />
    </>
  );
}
