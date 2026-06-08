"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CinematicBackground } from "@/components/webgl/CinematicBackground";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/content";
import { useI18n } from "@/components/providers/AppProviders";

const line = {
  hidden: { y: "115%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.12 },
  }),
};

const floats = [
  { label: "RAG", x: "8%", y: "30%", d: 0 },
  { label: "Agents", x: "82%", y: "26%", d: 0.6 },
  { label: "Evals", x: "14%", y: "68%", d: 1.1 },
  { label: "Vision", x: "86%", y: "64%", d: 0.3 },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { t } = useI18n();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section
      ref={ref}
      className="dark grain relative flex min-h-screen flex-col justify-center overflow-hidden bg-base"
    >
      <motion.div style={{ scale }} className="absolute inset-0">
        <CinematicBackground className="absolute inset-0" />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-base/70 via-base/20 to-base" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,transparent_20%,var(--color-base)_95%)]" />

      {floats.map((f) => (
        <motion.div
          key={f.label}
          className="pointer-events-none absolute hidden lg:block"
          style={{ left: f.x, top: f.y }}
          animate={{ y: [0, -14, 0] }}
          transition={{
            duration: 6 + f.d,
            repeat: Infinity,
            ease: "easeInOut",
            delay: f.d,
          }}
        >
          <span className="glass rounded-full border border-line-bright px-3 py-1.5 font-mono text-[0.7rem] text-muted">
            {f.label}
          </span>
        </motion.div>
      ))}

      <motion.div style={{ y, opacity }} className="shell relative z-10 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-line-bright glass px-3.5 py-1.5"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <span className="font-mono text-[0.72rem] tracking-wide text-muted">
            {t.hero.badge}
          </span>
        </motion.div>

        <h1 className="max-w-5xl text-[clamp(2.8rem,9vw,7.5rem)] font-semibold leading-[0.92] tracking-[-0.035em]">
          <span className="block overflow-hidden">
            <motion.span
              custom={0}
              variants={line}
              initial="hidden"
              animate="visible"
              className="block text-gradient"
            >
              {t.hero.line1}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              custom={1}
              variants={line}
              initial="hidden"
              animate="visible"
              className="block"
            >
              <span className="serif italic text-glow">{t.hero.line2serif}</span>{" "}
              <span className="text-gradient">{t.hero.line2rest}</span>
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-muted"
        >
          {site.name} {t.hero.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Button href="/contact" size="lg" arrow magnetic>
            {t.hero.ctaPrimary}
          </Button>
          <Button href="/services" size="lg" variant="secondary" magnetic>
            {t.hero.ctaSecondary}
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-faint">
            {t.hero.scroll}
          </span>
          <div className="flex h-9 w-5 justify-center rounded-full border border-line-bright pt-1.5">
            <motion.span
              className="h-1.5 w-1 rounded-full bg-accent"
              animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
