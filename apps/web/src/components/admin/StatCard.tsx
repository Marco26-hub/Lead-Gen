export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="panel rounded-2xl p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-faint">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
