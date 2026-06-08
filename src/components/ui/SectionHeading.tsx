"use client";

import type { ReactNode } from "react";
import { AnimatedText } from "./AnimatedText";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
      )}
      <AnimatedText
        text={title}
        as="h2"
        className={cn(
          "mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl",
          align === "center" && "justify-center",
        )}
      />
      {description && (
        <Reveal delay={0.1}>
          <div className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            {description}
          </div>
        </Reveal>
      )}
    </div>
  );
}
