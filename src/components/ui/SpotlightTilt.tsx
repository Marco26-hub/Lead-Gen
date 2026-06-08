"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Premium card wrapper: cursor-follow spotlight + subtle 3D tilt + (caller's)
 * glow border on hover. Mouse-only and reduced-motion-safe. Pass the card's
 * surface classes (panel, rounded, padding) via className.
 */
export function SpotlightTilt({
  children,
  className,
  tilt = 6,
}: {
  children: ReactNode;
  className?: string;
  tilt?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 250, damping: 28 });
  const sy = useSpring(my, { stiffness: 250, damping: 28 });
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });
  const bg = useMotionTemplate`radial-gradient(260px circle at ${sx}px ${sy}px, rgba(63,220,255,0.14), transparent 60%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    mx.set(x);
    my.set(y);
    ry.set((x / r.width - 0.5) * tilt);
    rx.set((y / r.height - 0.5) * -tilt);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={
        reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 1000 }
      }
      className={cn(
        "group/st relative overflow-hidden [transform-style:preserve-3d]",
        className,
      )}
    >
      {children}
      {!reduce && (
        <motion.div
          style={{ background: bg }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/st:opacity-100"
        />
      )}
    </motion.div>
  );
}
