import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grain flex min-h-screen flex-col items-center justify-center bg-base px-6 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-medium text-ink-inverse transition-colors hover:bg-white"
      >
        Back home
      </Link>
    </div>
  );
}
