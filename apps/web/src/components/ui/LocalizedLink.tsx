"use client";

import Link from "next/link";
import { forwardRef, type ComponentProps } from "react";
import { useI18n } from "@/components/providers/AppProviders";
import { localePath } from "@/lib/utils";

type LinkProps = ComponentProps<typeof Link>;

/** A next/link that automatically prefixes string hrefs with the active locale. */
export const LocalizedLink = forwardRef<HTMLAnchorElement, LinkProps>(
  function LocalizedLink({ href, ...props }, ref) {
    const { lang } = useI18n();
    const localized = typeof href === "string" ? localePath(lang, href) : href;
    return <Link ref={ref} href={localized} {...props} />;
  },
);
