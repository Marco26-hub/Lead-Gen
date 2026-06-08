"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/components/providers/AppProviders";

export function Manifesto() {
  const { t } = useI18n();
  const lines = t.manifesto.lines;

  return (
    <section className="relative py-32 md:py-48">
      <div className="shell">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow mb-12">{t.manifesto.eyebrow}</p>
          <div className="space-y-3 text-3xl font-medium leading-[1.18] tracking-tight sm:text-5xl sm:leading-[1.12]">
            {lines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0.12 }}
                whileInView={{ opacity: i === lines.length - 1 ? 1 : 0.92 }}
                viewport={{ margin: "-30% 0px -30% 0px" }}
                transition={{ duration: 0.6 }}
                className={i === 1 || i === 2 ? "text-muted" : ""}
              >
                {i === lines.length - 1 ? (
                  <span className="serif italic text-glow">{line}</span>
                ) : (
                  line
                )}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
