"use client";

import { useTransition } from "react";

/** Small destructive action with a confirm() guard. */
export function DeleteButton({
  action,
  label = "Delete",
  confirmText = "Are you sure? This can't be undone.",
}: {
  action: () => Promise<void>;
  label?: string;
  confirmText?: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) start(() => action());
      }}
      className="text-xs text-faint transition-colors hover:text-warn disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}
