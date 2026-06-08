"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";

/**
 * Inline status dropdown that calls a (bound) server action on change.
 * Pass `action` already bound to the row id, e.g.
 *   action={updateLeadStatus.bind(null, lead.id)}
 */
export function StatusSelect<T extends string>({
  value,
  options,
  action,
  className,
}: {
  value: T;
  options: readonly T[];
  action: (status: T) => Promise<void>;
  className?: string;
}) {
  const [pending, start] = useTransition();

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as T;
        start(() => action(next));
      }}
      className={cn(
        "cursor-pointer rounded-md border border-line bg-surface px-2 py-1 text-xs capitalize text-ink outline-none transition-colors focus:border-accent/60 disabled:opacity-50",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-surface capitalize">
          {o}
        </option>
      ))}
    </select>
  );
}
