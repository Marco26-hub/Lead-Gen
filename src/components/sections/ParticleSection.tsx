"use client";

import { ParticleField } from "@/components/webgl/ParticleField";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/components/providers/AppProviders";

export function ParticleSection() {
  const { t } = useI18n();

  return (
    <section className="dark relative h-[110vh] overflow-hidden bg-base">
      <ParticleField className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-base to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-base to-transparent" />

      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center text-center">
        <div className="shell">
          <Reveal>
            <p className="eyebrow">{t.particle.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
              {t.particle.headingA}
              <span className="serif italic text-glow"> {t.particle.headingB}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted">
              {t.particle.copy}
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-faint">
              {t.particle.hint}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
