import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Aether",
  // Internal tool: keep it out of search engines.
  robots: { index: false, follow: false },
};

/**
 * Admin shell. Forces the dark token set regardless of the public site's
 * theme cookie, and sits OUTSIDE [lang] so it's never locale-redirected.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dark min-h-dvh bg-base text-ink">{children}</div>;
}
