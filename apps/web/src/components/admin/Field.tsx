import type { ReactNode } from "react";

/* Shared input styling for admin forms. */
export const adminInputClass =
  "w-full rounded-lg border border-line bg-surface/60 px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-accent/60 focus:bg-surface";

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
