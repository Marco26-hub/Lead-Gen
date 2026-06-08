"use client";

import { useI18n } from "@/components/providers/AppProviders";
import { caseStudies, caseLabels } from "@/lib/caseStudies";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Icons";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { cn } from "@/lib/utils";

export function CaseStudyScreen({ slug }: { slug: string }) {
  const { t, lang } = useI18n();
  const items = t.work.items;
  const idx = items.findIndex((p) => p.slug === slug);
  const project = items[idx];
  const cs = caseStudies[lang][slug];
  const labels = caseLabels[lang];

  if (!project || !cs) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[aether] CaseStudyScreen: missing data for slug "${slug}" — project:${!!project} caseStudy:${!!cs}`,
      );
    }
    return null;
  }

  const next = items[(idx + 1) % items.length];
  const meta = [
    { k: labels.category, v: project.category },
    { k: labels.year, v: project.year },
    { k: labels.impact, v: `${project.metric} · ${project.metricLabel}` },
  ];
  const narrative = [
    { k: labels.challenge, v: cs.challenge },
    { k: labels.approach, v: cs.approach },
    { k: labels.outcome, v: cs.outcome },
  ];

  return (
    <article>
      <header className="relative overflow-hidden pb-12 pt-36 md:pt-48">
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        <div className="shell relative">
          <LocalizedLink
            href="/work"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
          >
            <span aria-hidden>←</span>
            {labels.back}
          </LocalizedLink>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <p className="eyebrow">{project.category}</p>
            <span className="rounded-full border border-line-bright px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-wide text-faint">
              {labels.illustrative}
            </span>
          </div>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.4rem,6vw,4.8rem)] font-semibold leading-[0.98] tracking-tight">
            {project.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {project.blurb}
          </p>
        </div>
      </header>

      <div className="shell">
        <div className="panel relative aspect-[21/9] overflow-hidden rounded-3xl">
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-90",
              project.accent,
            )}
          />
          <div className="absolute inset-0 bg-base/40" />
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="grain absolute inset-0" />
          <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
            <p className="font-mono text-5xl font-semibold tracking-tight text-white drop-shadow md:text-7xl">
              {project.metric}
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-white/70">
              {project.metricLabel}
            </p>
          </div>
        </div>
      </div>

      <section className="shell mt-12 grid grid-cols-2 gap-6 border-y border-line py-8 md:grid-cols-3">
        {meta.map((m) => (
          <div key={m.k}>
            <p className="font-mono text-xs uppercase tracking-widest text-faint">
              {m.k}
            </p>
            <p className="mt-2 text-sm">{m.v}</p>
          </div>
        ))}
      </section>

      <section className="shell py-20 md:py-28">
        <div className="mx-auto grid max-w-4xl gap-14">
          {narrative.map((n, i) => (
            <Reveal key={n.k} delay={i * 0.05}>
              <div className="grid gap-4 md:grid-cols-[0.32fr_0.68fr]">
                <h2 className="font-mono text-sm uppercase tracking-widest text-accent">
                  {n.k}
                </h2>
                <p className="text-xl leading-relaxed text-ink/90">{n.v}</p>
              </div>
            </Reveal>
          ))}
          <Reveal>
            <div className="grid gap-4 md:grid-cols-[0.32fr_0.68fr]">
              <h2 className="font-mono text-sm uppercase tracking-widest text-accent">
                {labels.stack}
              </h2>
              <div className="flex flex-wrap gap-2">
                {cs.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-line-bright px-3 py-1.5 text-sm text-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line">
        <LocalizedLink href={`/work/${next.slug}`} className="group block">
          <div className="shell flex items-center justify-between gap-6 py-16 md:py-24">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-faint">
                {labels.next}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight transition-colors group-hover:text-accent md:text-5xl">
                {next.title}
              </p>
            </div>
            <ArrowRight className="h-8 w-8 shrink-0 text-accent transition-transform duration-300 group-hover:translate-x-2" />
          </div>
        </LocalizedLink>
      </section>
    </article>
  );
}
