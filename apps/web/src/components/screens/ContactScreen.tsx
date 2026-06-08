"use client";

import { useI18n } from "@/components/providers/AppProviders";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/content";

const STEPS = ["01", "02", "03"];

export function ContactScreen() {
  const { t } = useI18n();

  return (
    <>
      <PageHeader
        eyebrow={t.contact.headerEyebrow}
        title={t.contact.headerTitle}
        description={t.contact.headerDesc}
      />

      <section className="shell pb-32 md:pb-40">
        <div className="grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
          <div className="flex flex-col gap-10">
            <Reveal>
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-faint">
                  {t.contact.email}
                </p>
                <a
                  href={`mailto:${site.email}`}
                  className="mt-2 block text-xl text-ink transition-colors hover:text-accent"
                >
                  {site.email}
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-faint">
                  {t.contact.studios}
                </p>
                <p className="mt-2 text-xl text-ink">{t.brand.location}</p>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-faint">
                  {t.contact.nextLabel}
                </p>
                <ul className="mt-4 space-y-4">
                  {t.contact.next.map((n, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="font-mono text-sm text-accent">
                        {STEPS[i]}
                      </span>
                      <span className="max-w-xs text-sm leading-relaxed text-muted">
                        {n}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="flex gap-5 pt-2">
                {site.social.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
