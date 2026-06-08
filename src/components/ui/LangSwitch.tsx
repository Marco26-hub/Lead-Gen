"use client";

import { useI18n } from "@/components/providers/AppProviders";
import { LANGS, LANG_LABEL } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangSwitch() {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.ui.language}
      className="flex items-center gap-0.5 rounded-full border border-line-bright p-0.5 font-mono text-[0.7rem]"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          data-cursor
          className={cn(
            "rounded-full px-2 py-1 transition-colors duration-200",
            lang === l ? "bg-elevated text-ink" : "text-muted hover:text-ink",
          )}
        >
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
