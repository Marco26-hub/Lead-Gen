"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useI18n, useTheme } from "@/components/providers/AppProviders";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const label = theme === "light" ? t.ui.themeToDark : t.ui.themeToLight;

  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      data-cursor
      className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-line-bright text-muted transition-colors hover:text-ink"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute"
        >
          {theme === "light" ? (
            // moon → click to go dark
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
                fill="currentColor"
              />
            </svg>
          ) : (
            // sun → click to go light
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
            </svg>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
