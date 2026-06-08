"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedTextProps = {
  text: string;
  className?: string;
  delay?: number;
  /** stagger between words */
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  once?: boolean;
};

const wordVariants: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Reveals text word-by-word with a clip-mask wipe. Each word sits inside an
 * overflow-hidden wrapper and slides up into view, staggered on scroll.
 */
export function AnimatedText({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  as = "span",
  once = true,
}: AnimatedTextProps) {
  const words = text.split(" ");
  // All intrinsic motion components share the same base prop shape; cast to one
  // concrete type so the dynamic tag stays type-safe without a complex union.
  const Tag = motion[as] as typeof motion.span;

  return (
    <Tag
      className={cn("inline-flex flex-wrap", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-12% 0px" }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="mr-[0.28em] inline-flex overflow-hidden py-[0.04em] align-bottom"
        >
          <motion.span variants={wordVariants} className="inline-block">
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
