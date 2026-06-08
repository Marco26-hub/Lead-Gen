"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/AppProviders";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { ArrowRight } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * Premium work carousel. Header + first card are aligned to the shell content
 * edge; the track full-bleeds to the right viewport edge (cards fade off the
 * right). Native scroll-snap, swipe (touch/trackpad) and arrow buttons.
 */
export function WorkShowcase() {
  const { t } = useI18n();
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const nudge = (dir: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.min(el.clientWidth * 0.8, 340),
      behavior: "smooth",
    });
  };

  return (
    <section className="relative py-20 md:py-28">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
          <div>
            <p className="eyebrow">{t.work.eyebrow}</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              {t.work.heading}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden max-w-xs text-sm leading-relaxed text-muted lg:block">
              {t.work.note}
            </p>
            <div className="flex gap-2">
              {[-1, 1].map((dir) => (
                <button
                  key={dir}
                  onClick={() => nudge(dir)}
                  disabled={dir === -1 ? atStart : atEnd}
                  aria-label={dir === -1 ? "Previous" : "Next"}
                  className="grid h-11 w-11 place-items-center rounded-full border border-line-bright text-ink transition-all duration-300 hover:border-accent/60 hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowRight
                    className={cn("h-4 w-4", dir === -1 && "rotate-180")}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* track: aligned left to the shell, full-bleed right */}
        <div className="bleed-right relative mt-10 md:mt-12">
          <div
            ref={scroller}
            onScroll={update}
            className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto py-4 pr-6 md:py-6 md:pr-10"
          >
            {t.work.items.map((project, i) => (
              <div
                key={project.slug}
                className="w-[78vw] shrink-0 snap-start sm:w-[290px] md:w-[310px]"
              >
                <ProjectCard project={project} index={i} />
              </div>
            ))}
            <LocalizedLink
              href="/work"
              className="group flex w-[60vw] shrink-0 snap-start flex-col justify-center sm:w-[220px]"
            >
              <div className="panel grid aspect-[4/3] place-items-center rounded-[1.4rem] transition-colors duration-300 group-hover:border-accent/60">
                <div className="text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line-bright transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight className="h-5 w-5 text-accent" />
                  </div>
                  <p className="mt-4 text-base font-medium">{t.work.viewAll}</p>
                </div>
              </div>
            </LocalizedLink>
          </div>

          {/* right-edge fade hints more cards */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-base to-transparent md:w-16" />
        </div>
      </div>
    </section>
  );
}
