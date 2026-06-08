"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/components/providers/AppProviders";
import { Plus } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export function FAQ() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="shell py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
        <div className="md:sticky md:top-32 md:self-start">
          <p className="eyebrow">{t.faq.eyebrow}</p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            {t.faq.titleA}
            <br />
            <span className="text-muted">{t.faq.titleB}</span>
          </h2>
        </div>

        <div>
          {t.faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-t border-line last:border-b">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-lg font-medium tracking-tight md:text-xl">
                    {item.q}
                  </span>
                  <Plus
                    className={cn(
                      "h-4 w-4 shrink-0 text-accent transition-transform duration-300",
                      isOpen && "rotate-45",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 text-base leading-relaxed text-muted">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
