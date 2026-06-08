import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { SignOutButton } from "@/components/admin/SignOutButton";

/**
 * Lead-gen dashboard shell. Lives under /app and is gated by the SAME
 * Better Auth admin session as /admin (single login for the whole gestionale).
 * The dashboard UI is built for a dark zinc theme, so we force it here rather
 * than in global CSS (the marketing site keeps its own theme system).
 */
export const metadata = {
  title: "Lead Gen — Social Web Automation",
  robots: { index: false, follow: false },
};

export default async function LeadgenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="flex h-14 items-center gap-4 border-b border-zinc-800 px-5 md:px-8">
        <Link href="/app" className="font-semibold tracking-tight">
          Lead Gen
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-400">
          <Link href="/app/leads" className="hover:text-zinc-100">Lead</Link>
          <Link href="/app/scrape" className="hover:text-zinc-100">Scraping</Link>
          <Link href="/app/settings" className="hover:text-zinc-100">Impostazioni</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <Link href="/admin" className="text-zinc-400 hover:text-zinc-100">
            ← Admin sito
          </Link>
          <span className="hidden text-zinc-500 sm:inline">{session.user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="p-5 md:p-8">{children}</main>
    </div>
  );
}
