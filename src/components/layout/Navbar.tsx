"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { site } from "@/lib/content";
import { useI18n } from "@/components/providers/AppProviders";
import { cn, localePath } from "@/lib/utils";
import { Logo, ArrowUpRight } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LangSwitch } from "@/components/ui/LangSwitch";

export function Navbar() {
  const pathname = usePathname();
  const { t, lang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (open) return;
    setHidden(y > prev && y > 320);
  });

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className="shell">
          <div
            className={cn(
              "mt-3 flex items-center justify-between rounded-full border px-3 py-2 transition-all duration-500 md:mt-4 md:px-4",
              scrolled
                ? "glass border-line-bright"
                : "border-transparent bg-transparent",
            )}
          >
            <LocalizedLink
              href="/"
              className="group flex items-center gap-2.5 pl-1.5"
              aria-label={`${site.name} — home`}
            >
              <Logo className="h-5 w-5 text-accent transition-transform duration-500 group-hover:rotate-[200deg]" />
              <span className="text-[0.95rem] font-semibold tracking-tight">
                {site.name}
              </span>
            </LocalizedLink>

            <nav className="hidden items-center gap-1 md:flex">
              {t.nav.items.map((item) => {
                const active = pathname === localePath(lang, item.href);
                return (
                  <LocalizedLink
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm transition-colors duration-300",
                      active ? "text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-elevated"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                    {item.label}
                  </LocalizedLink>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 md:flex">
                <LangSwitch />
                <ThemeToggle />
                <Button href="/contact" size="sm" arrow magnetic>
                  {t.nav.cta}
                </Button>
              </div>
              <Magnetic strength={0.25}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  aria-label="Menu"
                  aria-expanded={open}
                  className="grid h-10 w-10 place-items-center rounded-full border border-line-bright md:hidden"
                >
                  <span className="relative block h-3 w-4">
                    <span
                      className={cn(
                        "absolute left-0 h-px w-full bg-ink transition-all duration-300",
                        open ? "top-1.5 rotate-45" : "top-0.5",
                      )}
                    />
                    <span
                      className={cn(
                        "absolute left-0 h-px w-full bg-ink transition-all duration-300",
                        open ? "top-1.5 -rotate-45" : "top-2.5",
                      )}
                    />
                  </span>
                </button>
              </Magnetic>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 grain bg-base/95 backdrop-blur-xl md:hidden"
          >
            <div className="shell flex h-full flex-col justify-center gap-2 pt-20">
              {t.nav.items.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i + 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <LocalizedLink
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between border-b border-line py-5"
                  >
                    <span className="text-4xl font-medium tracking-tight">
                      {item.label}
                    </span>
                    <ArrowUpRight className="h-6 w-6 text-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent" />
                  </LocalizedLink>
                </motion.div>
              ))}
              <div className="mt-8 flex items-center justify-between">
                <LangSwitch />
                <ThemeToggle />
              </div>
              <div className="mt-4">
                <Button href="/contact" size="lg" arrow className="w-full">
                  {t.nav.cta}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
