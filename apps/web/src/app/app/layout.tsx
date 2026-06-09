import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { AppSidebar } from "@/leadgen/components/AppSidebar";

/**
 * Unified admin dashboard shell. Lives under /app, gated by Better Auth
 * (`requireAdmin`). One sidebar for everything: Panoramica, Lead, Clienti,
 * Appuntamenti, Scraping, Impostazioni. Dark zinc theme (forced here so the
 * marketing site keeps its own theme system).
 */
export const metadata = {
  title: "Dashboard — Social Web Automation",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-dvh bg-zinc-950 text-zinc-100">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-zinc-800 px-5 md:px-8">
          <Link href="/app" className="font-semibold tracking-tight md:hidden">
            Social Web
          </Link>
          {/* Mobile quick-nav (sidebar is desktop-only). */}
          <nav className="flex items-center gap-3 text-sm text-zinc-400 md:hidden">
            <Link href="/app/leads" className="hover:text-zinc-100">Lead</Link>
            <Link href="/app/clients" className="hover:text-zinc-100">Clienti</Link>
            <Link href="/app/scrape" className="hover:text-zinc-100">Scraping</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-zinc-500 sm:inline">{session.user.email}</span>
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
