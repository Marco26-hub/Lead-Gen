"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import type { Dict } from "@/lib/i18n";
import { cn, pad } from "@/lib/utils";
import { ArrowUpRight } from "./Icons";
import { LocalizedLink } from "./LocalizedLink";

type Project = Dict["work"]["items"][number];

export function ProjectCard({
  project,
  index,
  className,
}: {
  project: Project;
  index: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mediaRef = useRef<HTMLDivElement>(null);

  // pointer-driven spotlight + subtle 3D tilt
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 220, damping: 24 });
  const sy = useSpring(py, { stiffness: 220, damping: 24 });
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(240px circle at ${sx}px ${sy}px, rgba(255,255,255,0.22), transparent 60%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Mouse only — never tilt during a touch swipe in the carousel.
    if (reduce || e.pointerType !== "mouse") return;
    const el = mediaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    px.set(x);
    py.set(y);
    rotateY.set((x / r.width - 0.5) * 9);
    rotateX.set((y / r.height - 0.5) * -9);
  };
  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={cn("group", className)}
    >
      <LocalizedLink href={`/work/${project.slug}`} className="block">
        {/* media */}
        <motion.div
          ref={mediaRef}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
          className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem] border border-line ring-1 ring-inset ring-white/10 [transform-style:preserve-3d]"
        >
          {/* base accent gradient */}
          <div
            className={cn("absolute inset-0 bg-gradient-to-br", project.accent)}
          />
          {/* aurora blooms */}
          <div className="absolute -left-12 -top-12 h-52 w-52 rounded-full bg-white/25 blur-3xl mix-blend-overlay" />
          <div className="absolute -bottom-16 -right-10 h-60 w-60 rounded-full bg-white/15 blur-3xl" />
          {/* legibility wash */}
          <div className="absolute inset-0 bg-gradient-to-t from-base/85 via-base/15 to-transparent" />
          {/* engineering grid */}
          <div className="absolute inset-0 bg-grid opacity-[0.18]" />
          {/* ghost metric */}
          <span className="pointer-events-none absolute right-3 top-1 select-none font-mono text-[4.5rem] font-semibold leading-none tracking-tighter text-white/10">
            {project.metric}
          </span>
          {/* grain */}
          <div className="grain absolute inset-0" />
          {/* cursor spotlight */}
          {!reduce && (
            <motion.div
              style={{ background: spotlight }}
              className="absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
          {/* top sheen */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* arrow badge */}
          <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-base/50 text-ink backdrop-blur-md transition-colors duration-300 group-hover:bg-accent group-hover:text-ink-inverse">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          {/* metric */}
          <div className="absolute bottom-5 left-5">
            <p className="text-4xl font-semibold tracking-tight text-white drop-shadow-sm md:text-5xl">
              {project.metric}
            </p>
            <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-widest text-white/75">
              {project.metricLabel}
            </p>
          </div>
        </motion.div>

        {/* meta */}
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-faint">
                {pad(index + 1)}
              </span>
              <span className="font-mono text-[0.7rem] uppercase tracking-widest text-accent">
                {project.category}
              </span>
            </div>
            <h3 className="mt-2 text-xl font-medium tracking-tight transition-colors duration-300 group-hover:text-accent">
              {project.title}
            </h3>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">
              {project.blurb}
            </p>
          </div>
          <span className="shrink-0 font-mono text-xs text-faint">
            {project.year}
          </span>
        </div>
      </LocalizedLink>
    </motion.div>
  );
}
