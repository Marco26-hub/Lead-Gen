"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Icons";

type NavItem = { href: string; label: string; exact?: boolean };

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/app/leads", label: "Lead Gen" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/appointments", label: "Appointments" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface/40 md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-line px-5">
        <Logo className="h-6 w-6 text-accent" />
        <span className="font-semibold tracking-tight">Aether</span>
        <span className="ml-1 rounded bg-elevated px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-muted">
          Admin
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent/10 text-ink"
                  : "text-muted hover:bg-elevated hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
