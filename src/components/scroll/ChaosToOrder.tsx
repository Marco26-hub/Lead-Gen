"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useI18n } from "@/components/providers/AppProviders";
import { clamp } from "@/lib/utils";

type Particle = {
  cx: number;
  cy: number;
  tx: number;
  ty: number;
  phase: number;
  speed: number;
  amp: number;
  size: number;
  hue: [number, number, number];
};

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const TOTAL_FRAMES = 180; // 12s @ 15fps — for the on-screen frame counter

export function ChaosToOrder() {
  const { t, lang } = useI18n();
  const word = lang === "it" ? "ORDINE" : "ORDER";

  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const eased = useTransform(scrollYProgress, [0.1, 0.85], [0, 1], {
    clamp: true,
  });
  useMotionValueEvent(eased, "change", (v) => {
    progressRef.current = v;
  });

  const chaosOpacity = useTransform(scrollYProgress, [0.12, 0.4], [1, 0]);
  const orderOpacity = useTransform(scrollYProgress, [0.55, 0.82], [0, 1]);
  const frame = useTransform(eased, (v) =>
    String(Math.round(v * TOTAL_FRAMES)).padStart(3, "0"),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      if (process.env.NODE_ENV !== "production")
        console.warn("[aether] ChaosToOrder: 2D canvas context unavailable");
      return;
    }

    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;

    const buildTargets = (): { x: number; y: number }[] => {
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d");
      if (!octx) {
        if (process.env.NODE_ENV !== "production")
          console.warn("[aether] ChaosToOrder: offscreen 2D context unavailable");
        return [];
      }
      const fs = Math.min(w * 0.2, h * 0.62);
      octx.fillStyle = "#fff";
      octx.font = `900 ${fs}px Geist, Arial, sans-serif`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillText(word, w / 2, h / 2);

      const data = octx.getImageData(0, 0, w, h).data;
      const pts: { x: number; y: number }[] = [];
      const gap = Math.max(4, Math.round(w / 240));
      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          if (data[(y * w + x) * 4 + 3] > 128) pts.push({ x, y });
        }
      }
      return pts;
    };

    const seed = () => {
      const targets = buildTargets();
      particles = targets.map((tp) => ({
        cx: Math.random() * w,
        cy: Math.random() * h,
        tx: tp.x,
        ty: tp.y,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.9,
        amp: 30 + Math.random() * 90,
        size: 1 + Math.random() * 1.4,
        hue: (() => {
          const r = Math.random();
          if (r < 0.5) return [63, 220, 255];
          if (r < 0.8) return [91, 140, 255];
          return [139, 108, 255];
        })(),
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio, 2);
      w = Math.floor(rect.width);
      h = Math.floor(rect.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let time = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      time += 0.016;
      const p = easeInOut(clamp(progressRef.current));
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        const chaosX = pt.cx + Math.cos(time * pt.speed + pt.phase) * pt.amp;
        const chaosY =
          pt.cy + Math.sin(time * pt.speed * 0.8 + pt.phase) * pt.amp;
        const x = chaosX + (pt.tx - chaosX) * p;
        const y = chaosY + (pt.ty - chaosY) * p;

        const bright = 0.35 + p * 0.65;
        const [r, g, b] = pt.hue;
        const size = pt.size * (0.7 + p * 0.7);
        ctx.fillStyle = `rgba(${r},${g},${b},${bright})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [word]);

  return (
    <section
      ref={sectionRef}
      className="dark relative"
      style={{ height: "320vh" }}
      aria-label={`${t.chaos.headingA} ${t.chaos.headingB}`}
    >
      <div className="sticky top-0 grain h-screen w-full overflow-hidden bg-base">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,transparent_30%,var(--color-base)_92%)]" />

        <div className="shell pointer-events-none relative flex h-full flex-col justify-between py-12">
          <div className="flex items-start justify-between">
            <div className="max-w-sm">
              <p className="eyebrow">{t.chaos.eyebrow}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t.chaos.caption}
              </p>
            </div>
            <div className="text-right font-mono text-xs text-faint">
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                {t.chaos.live}
              </div>
              <motion.div className="mt-1 text-ink">
                {t.chaos.frame} <motion.span>{frame}</motion.span> /{" "}
                {TOTAL_FRAMES}
              </motion.div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.span
              style={{ opacity: chaosOpacity }}
              className="absolute font-mono text-[11px] uppercase tracking-[0.5em] text-faint"
            >
              {t.chaos.entropy}
            </motion.span>
            <motion.span
              style={{ opacity: orderOpacity }}
              className="absolute -bottom-2 font-mono text-[11px] uppercase tracking-[0.5em] text-accent"
            >
              {t.chaos.resolved}
            </motion.span>
          </div>

          <div className="flex items-end justify-between">
            <h2 className="max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              {t.chaos.headingA}
              <span className="serif italic text-glow"> {t.chaos.headingB}</span>
            </h2>
            <p className="hidden max-w-[15rem] text-right text-xs leading-relaxed text-muted sm:block">
              {t.chaos.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
