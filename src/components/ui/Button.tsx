"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Magnetic } from "./Magnetic";
import { LocalizedLink } from "./LocalizedLink";
import { ArrowUpRight } from "./Icons";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  magnetic?: boolean;
  className?: string;
};

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors duration-300 will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.82rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[0.95rem]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-ink-inverse hover:bg-white shadow-[0_10px_40px_-12px_rgba(63,220,255,0.5)]",
  secondary:
    "border border-line-bright bg-surface/60 text-ink hover:border-accent/60 hover:bg-elevated",
  ghost: "text-muted hover:text-ink",
};

function Inner({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      <span className="relative z-10">{children}</span>
      {arrow && (
        <ArrowUpRight className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </>
  );
}

export function Button({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  arrow = false,
  magnetic = false,
  className,
  disabled,
}: CommonProps & {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const classes = cn(base, sizes[size], variants[variant], className);

  const content = href ? (
    <LocalizedLink href={href} className={classes}>
      <Inner arrow={arrow}>{children}</Inner>
    </LocalizedLink>
  ) : (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  );

  return magnetic ? <Magnetic strength={0.3}>{content}</Magnetic> : content;
}
