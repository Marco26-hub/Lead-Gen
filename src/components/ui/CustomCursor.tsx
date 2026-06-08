"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useHasPointer } from "@/hooks/useMediaQuery";

/**
 * A subtle glowing cursor companion that grows over interactive elements.
 * Rendered only for real pointers; the native cursor is kept for usability.
 */
export function CustomCursor() {
  const hasPointer = useHasPointer();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!hasPointer) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as HTMLElement | null;
      setActive(!!target?.closest("a, button, [data-cursor]"));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [hasPointer, x, y]);

  if (!hasPointer) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-screen"
    >
      <motion.div
        animate={{
          width: active ? 46 : 16,
          height: active ? 46 : 16,
          opacity: active ? 0.9 : 0.55,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-accent/10 backdrop-blur-[1px]"
      />
    </motion.div>
  );
}
