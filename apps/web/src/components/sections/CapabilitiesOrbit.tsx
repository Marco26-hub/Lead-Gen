"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useI18n } from "@/components/providers/AppProviders";
import type { Dict } from "@/lib/i18n";
import { clamp, lerp, pad } from "@/lib/utils";

type Cap = Dict["pillars"]["items"][number];

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function OrbitNode({
  progress,
  index,
  total,
  scale,
  cap,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  scale: number;
  cap: Cap;
}) {
  const baseAngle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const orbitR = 250 + index * 14;
  const spin = Math.PI * 1.5 + index * 0.35;
  const slotX = 150;
  const slotY = (index - (total - 1) / 2) * 104;

  const x = useTransform(progress, (p) => {
    const e = easeInOut(clamp(p));
    const ang = baseAngle + (1 - e) * spin;
    const orbX = Math.cos(ang) * orbitR;
    return lerp(orbX, slotX, e) * scale;
  });
  const y = useTransform(progress, (p) => {
    const e = easeInOut(clamp(p));
    const ang = baseAngle + (1 - e) * spin;
    const orbY = Math.sin(ang) * orbitR;
    return lerp(orbY, slotY, e) * scale;
  });
  const settle = useTransform(progress, [0.55, 1], [0, 1]);
  const cardOpacity = useTransform(progress, [0.5, 0.92], [0.55, 1]);
  // Scale the settled width with the stage so 5 cards never overflow on mobile.
  const cardWidth = useTransform(settle, [0, 1], [180 * scale, 320 * scale]);

  return (
    <motion.div
      style={{ x, y, opacity: cardOpacity }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <motion.div
        style={{ width: cardWidth }}
        className="panel rounded-2xl p-4 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.7rem] text-accent">
            {pad(cap.index)}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_2px_rgba(63,220,255,0.6)]" />
          <h3 className="text-sm font-semibold tracking-tight">{cap.title}</h3>
        </div>
        <motion.p
          style={{ opacity: settle }}
          className="mt-2 text-xs leading-relaxed text-muted"
        >
          {cap.summary}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export function CapabilitiesOrbit() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const items = t.pillars.items;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const measure = () => {
      const w = stageRef.current?.clientWidth ?? 1100;
      setScale(clamp(w / 1100, 0.5, 1));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const coreX = useTransform(scrollYProgress, [0, 1], [0, -260 * scale]);
  const ringOpacity = useTransform(scrollYProgress, [0, 0.6], [0.5, 0]);
  const corePulse = useTransform(scrollYProgress, [0, 1], [1, 0.86]);

  return (
    <section ref={sectionRef} style={{ height: "300vh" }} className="relative">
      <div
        ref={stageRef}
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
      >
        <div className="shell pointer-events-none absolute top-0 left-0 right-0 z-20 pt-[12vh]">
          <p className="eyebrow">{t.pillars.eyebrow}</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            {t.pillars.titleA}
            <span className="text-muted"> {t.pillars.titleB}</span>
          </h2>
        </div>

        <motion.svg
          style={{ opacity: ringOpacity }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          width={760 * scale}
          height={760 * scale}
          viewBox="0 0 760 760"
          fill="none"
        >
          {[260, 330, 380].map((r) => (
            <circle
              key={r}
              cx={380}
              cy={380}
              r={r}
              stroke="var(--color-line-bright)"
              strokeWidth={1}
              strokeDasharray="2 8"
            />
          ))}
        </motion.svg>

        <motion.div
          style={{ x: coreX, scale: corePulse }}
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative grid h-28 w-28 place-items-center rounded-full">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(63,220,255,0.45),transparent_70%)] blur-md" />
            <div className="glass relative grid h-24 w-24 place-items-center rounded-full border border-line-bright">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-accent">
                {t.pillars.core}
              </span>
            </div>
          </div>
        </motion.div>

        {items.map((cap, i) => (
          <OrbitNode
            key={cap.id}
            progress={scrollYProgress}
            index={i}
            total={items.length}
            scale={scale}
            cap={cap}
          />
        ))}

        <div className="pointer-events-none absolute bottom-[8vh] left-0 right-0 shell">
          <div className="hairline" />
        </div>
      </div>
    </section>
  );
}
