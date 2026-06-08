import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getAdminSession();
  if (session?.user.role === "admin") redirect("/admin");

  const { error } = await searchParams;
  const initialError =
    error === "forbidden"
      ? "You don't have access to this area."
      : undefined;

  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-9 w-9 text-accent" />
          <h1 className="mt-4 text-xl font-semibold tracking-tight">
            Aether Admin
          </h1>
          <p className="mt-1 text-sm text-muted">Sign in to continue</p>
        </div>
        <div className="panel rounded-2xl p-6">
          <LoginForm initialError={initialError} />
        </div>
      </div>
    </div>
  );
}
