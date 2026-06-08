"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/components/providers/AppProviders";

export function Stats() {
  const { t } = useI18n();

  return (
    <section className="relative border-y border-line bg-surface/40 py-20 md:py-28">
      <div className="shell">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {t.stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col"
            >
              <span className="text-5xl font-semibold tracking-tight text-gradient md:text-7xl">
                {s.value}
              </span>
              <span className="mt-4 max-w-[14rem] text-sm leading-relaxed text-muted">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
