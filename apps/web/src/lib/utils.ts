import { clsx, type ClassValue } from "clsx";

/** Merge class names conditionally. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Clamp a number between min and max. */
export function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Map a value from one range to another. */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) {
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

/** Pad an index for editorial numbering (01, 02, …). */
export function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Prefix an internal path with the active locale (passes external/anchor hrefs through). */
export function localePath(lang: string, path: string) {
  if (
    !path ||
    path.startsWith("http") ||
    path.startsWith("mailto:") ||
    path.startsWith("#")
  ) {
    return path;
  }
  const clean = path === "/" ? "" : path;
  return `/${lang}${clean}`;
}
