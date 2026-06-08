"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { dictionaries, type Dict, type Lang, type Theme } from "@/lib/i18n";

/* ------------------------------------------------------------
   Theme + language context. With localized routes, `lang` comes
   from the [lang] route segment (passed by the layout). Switching
   language navigates to the same path under the new locale.
   ------------------------------------------------------------ */

type I18nValue = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
type ThemeValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const I18nContext = createContext<I18nValue | null>(null);
const ThemeContext = createContext<ThemeValue | null>(null);

function persist(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value};path=/;max-age=31536000;samesite=lax`;
}

export function AppProviders({
  children,
  initialLang,
  initialTheme,
}: {
  children: ReactNode;
  initialLang: Lang;
  initialTheme: Theme;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  // Keep context in sync when the route's locale segment changes.
  useEffect(() => {
    setLangState(initialLang);
  }, [initialLang]);

  const setLang = useCallback(
    (l: Lang) => {
      persist("lang", l);
      setLangState(l);
      const rest = (pathname ?? "/").replace(/^\/(it|en)(?=\/|$)/, "");
      router.push(`/${l}${rest || ""}`);
    },
    [pathname, router],
  );

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    persist("theme", next);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", next === "light");
    }
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === "light" ? "dark" : "light"),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      <I18nContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>
        {children}
      </I18nContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <AppProviders>");
  return ctx;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <AppProviders>");
  return ctx;
}
