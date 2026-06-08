"use client";

import type { ReactNode } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Reveal } from "@/components/ui/Reveal";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
}: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-52">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_-10%,rgba(63,220,255,0.14),transparent_60%)]" />
      <div className="shell relative">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <AnimatedText
          text={title}
          as="h1"
          className="mt-6 max-w-5xl text-[clamp(2.6rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-tight"
        />
        {description && (
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted">
              {description}
            </p>
          </Reveal>
        )}
        {meta && <div className="mt-12">{meta}</div>}
      </div>
    </header>
  );
}
