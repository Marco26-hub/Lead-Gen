"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: string; exact?: boolean };

const NAV: NavItem[] = [
  { href: "/app", label: "Panoramica", icon: "🏠", exact: true },
  { href: "/app/leads", label: "Lead", icon: "🎯" },
  { href: "/app/clients", label: "Clienti", icon: "🤝" },
  { href: "/app/appointments", label: "Appuntamenti", icon: "📅" },
  { href: "/app/scrape", label: "Scraping", icon: "🔍" },
  { href: "/app/settings", label: "Impostazioni", icon: "⚙️" },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-5">
        <span className="font-semibold tracking-tight text-zinc-100">Social Web</span>
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-zinc-400">
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
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-500/30"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-800 p-3">
        <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-zinc-500 hover:text-zinc-200">
          ↗ Vai al sito
        </Link>
      </div>
    </aside>
  );
}
