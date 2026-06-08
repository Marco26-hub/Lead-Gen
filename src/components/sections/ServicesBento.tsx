"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/components/providers/AppProviders";
import { SpotlightTilt } from "@/components/ui/SpotlightTilt";
import { cn, pad } from "@/lib/utils";

// Mobile-first: a single stacked column on phones; a 6-col bento on desktop.
const spans = [
  "md:col-span-3",
  "md:col-span-3",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-2",
];

export function ServicesBento() {
  const { t } = useI18n();

  return (
    <section className="shell pb-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
        {t.pillars.items.map((p, i) => {
          const span = spans[i] ?? "md:col-span-2";
          const wide = span === "md:col-span-3";
          return (
            <motion.div
              key={p.id}
              id={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 0.6,
                delay: (i % 2) * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn("scroll-mt-28 h-full", span)}
            >
              <SpotlightTilt
                tilt={4}
                className="panel group/card h-full rounded-3xl p-6 transition-colors duration-300 hover:border-accent/50 md:p-8"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-accent">
                      {pad(p.index)}
                    </span>
                    <span className="h-px w-8 bg-line-bright transition-all duration-500 group-hover/card:w-12" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight md:text-3xl">
                    {p.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                    {p.summary}
                  </p>
                  <div className={cn("mt-7 grid gap-4", wide && "sm:grid-cols-2")}>
                    {p.services.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-2xl border border-line bg-surface/40 p-4 transition-colors duration-300 group-hover/card:border-line-bright"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium">{s.title}</p>
                          <span className="shrink-0 font-mono text-[0.62rem] uppercase tracking-wide text-accent">
                            {s.outcome}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-muted">
                          {s.blurb}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </SpotlightTilt>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
