import { requireAdmin } from "@/lib/admin/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { SignOutButton } from "@/components/admin/SignOutButton";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-line px-5 md:px-8">
          <span className="font-semibold tracking-tight md:hidden">
            Aether Admin
          </span>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-xs text-muted">{session.user.name}</p>
              <p className="text-[0.7rem] text-faint">{session.user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
