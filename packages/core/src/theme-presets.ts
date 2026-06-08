import type { ThemePreset } from './schemas';

export interface ThemeTokens {
  palette: {
    bg: string;
    surface: string;
    primary: string;
    accent: string;
    text: string;
    muted: string;
  };
  font: { heading: string; body: string };
}

/** Deterministic, server-applied design tokens per category preset (Claude never emits raw hex). */
export const THEME_TOKENS: Record<ThemePreset, ThemeTokens> = {
  restaurant: {
    palette: { bg: '#1a120b', surface: '#241811', primary: '#e0792f', accent: '#f2c14e', text: '#f7efe6', muted: '#c9b8a8' },
    font: { heading: "'Playfair Display', Georgia, serif", body: "'DM Sans', system-ui, sans-serif" },
  },
  lawyer: {
    palette: { bg: '#0b1220', surface: '#111c30', primary: '#1f4e79', accent: '#c9a44c', text: '#eef2f8', muted: '#9fb0c7' },
    font: { heading: "'Libre Baskerville', Georgia, serif", body: "'DM Sans', system-ui, sans-serif" },
  },
  gym: {
    palette: { bg: '#0a0a0a', surface: '#161616', primary: '#e63946', accent: '#f1faee', text: '#f5f5f5', muted: '#9a9a9a' },
    font: { heading: "'Anton', Impact, sans-serif", body: "'DM Sans', system-ui, sans-serif" },
  },
  beauty: {
    palette: { bg: '#fdf6f4', surface: '#ffffff', primary: '#c4727f', accent: '#e6b8a2', text: '#3a2c2e', muted: '#8a7378' },
    font: { heading: "'Cormorant Garamond', Georgia, serif", body: "'DM Sans', system-ui, sans-serif" },
  },
  medical: {
    palette: { bg: '#f3f8fb', surface: '#ffffff', primary: '#1c84c6', accent: '#3fb7a2', text: '#1f2d3a', muted: '#6b8198' },
    font: { heading: "'Poppins', system-ui, sans-serif", body: "'DM Sans', system-ui, sans-serif" },
  },
  retail: {
    palette: { bg: '#fafafa', surface: '#ffffff', primary: '#2b2b2b', accent: '#ff5a5f', text: '#1c1c1c', muted: '#777777' },
    font: { heading: "'Space Grotesk', system-ui, sans-serif", body: "'DM Sans', system-ui, sans-serif" },
  },
  artisan: {
    palette: { bg: '#13161a', surface: '#1d2127', primary: '#3a5f78', accent: '#f08c2e', text: '#eef1f4', muted: '#a4adb8' },
    font: { heading: "'Oswald', system-ui, sans-serif", body: "'DM Sans', system-ui, sans-serif" },
  },
  default: {
    palette: { bg: '#0f1117', surface: '#181b23', primary: '#5b6cff', accent: '#22d3ee', text: '#eef1f7', muted: '#9aa4b6' },
    font: { heading: "'Space Grotesk', system-ui, sans-serif", body: "'DM Sans', system-ui, sans-serif" },
  },
};

export function resolveTheme(preset: ThemePreset): ThemeTokens {
  return THEME_TOKENS[preset] ?? THEME_TOKENS.default;
}
