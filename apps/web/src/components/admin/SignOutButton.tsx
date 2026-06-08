"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-full border border-line-bright px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-accent/60 hover:text-ink disabled:opacity-50"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
