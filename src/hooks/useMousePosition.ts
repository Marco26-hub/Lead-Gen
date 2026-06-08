"use client";

import { useEffect, useRef } from "react";

export type Pointer = {
  /** pixel coordinates */
  x: number;
  y: number;
  /** normalized -1..1 from viewport center */
  nx: number;
  ny: number;
};

/**
 * Tracks the pointer in a ref (no re-renders) so WebGL / rAF loops can read
 * it cheaply every frame.
 */
export function usePointerRef() {
  const pointer = useRef<Pointer>({ x: 0, y: 0, nx: 0, ny: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      pointer.current.nx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ny = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return pointer;
}
