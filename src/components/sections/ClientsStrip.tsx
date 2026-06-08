"use client";

import { clients } from "@/lib/content";
import { useI18n } from "@/components/providers/AppProviders";
import { Marquee } from "@/components/ui/Marquee";
import { Spark } from "@/components/ui/Icons";

export function ClientsStrip() {
  const { t } = useI18n();
  return (
    <section className="relative border-y border-line bg-surface/40 py-10">
      <div className="shell mb-7">
        <p className="text-center font-mono text-[0.7rem] uppercase tracking-[0.3em] text-faint">
          {t.clients.label}
        </p>
      </div>
      <Marquee duration={32} className="mask-fade-x">
        {clients.map((c) => (
          <div key={c} className="flex items-center gap-3.5">
            <Spark className="h-3.5 w-3.5 text-accent/70" />
            <span className="text-2xl font-medium tracking-tight text-muted">
              {c}
            </span>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
