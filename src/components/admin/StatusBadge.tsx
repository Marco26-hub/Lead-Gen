import { cn } from "@/lib/utils";

/* Static class strings per status so Tailwind can see (and generate) them. */
const STYLES: Record<string, string> = {
  // leads
  new: "text-accent bg-accent/10 border-accent/30",
  contacted: "text-accent-2 bg-accent-2/10 border-accent-2/30",
  qualified: "text-positive bg-positive/10 border-positive/30",
  won: "text-positive bg-positive/10 border-positive/30",
  lost: "text-faint bg-faint/10 border-faint/30",
  // clients
  prospect: "text-accent-2 bg-accent-2/10 border-accent-2/30",
  active: "text-positive bg-positive/10 border-positive/30",
  paused: "text-warn bg-warn/10 border-warn/30",
  churned: "text-faint bg-faint/10 border-faint/30",
  // appointments
  scheduled: "text-accent bg-accent/10 border-accent/30",
  confirmed: "text-positive bg-positive/10 border-positive/30",
  completed: "text-muted bg-muted/10 border-muted/30",
  cancelled: "text-faint bg-faint/10 border-faint/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        STYLES[status] ?? "text-muted bg-muted/10 border-muted/30",
      )}
    >
      {status}
    </span>
  );
}
