"use client";

import { useRef, type ReactNode } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

type MarqueeProps = {
  children: ReactNode;
  /** seconds per loop */
  duration?: number;
  reverse?: boolean;
  className?: string;
  gap?: string;
  pauseOnHover?: boolean;
};

/**
 * Seamless infinite marquee driven by rAF (so it can pause on hover without
 * jumping). Content is duplicated; the track translates by exactly one copy.
 */
export function Marquee({
  children,
  duration = 28,
  reverse = false,
  className,
  gap = "3.5rem",
  pauseOnHover = false,
}: MarqueeProps) {
  const baseX = useMotionValue(0);
  const paused = useRef(false);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = reverse ? -1 : 1;

  useAnimationFrame((_, delta) => {
    if (paused.current || (typeof document !== "undefined" && document.hidden))
      return;
    const move = (50 / duration) * (delta / 1000) * dir;
    baseX.set(baseX.get() - move);
  });

  return (
    <div
      className={cn("relative flex overflow-hidden", className)}
      onPointerEnter={pauseOnHover ? () => (paused.current = true) : undefined}
      onPointerLeave={pauseOnHover ? () => (paused.current = false) : undefined}
    >
      <motion.div
        className="flex shrink-0 items-stretch"
        style={{ x, gap, paddingRight: gap }}
      >
        <div className="flex shrink-0 items-stretch" style={{ gap }}>
          {children}
        </div>
        <div
          className="flex shrink-0 items-stretch"
          style={{ gap }}
          aria-hidden="true"
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
