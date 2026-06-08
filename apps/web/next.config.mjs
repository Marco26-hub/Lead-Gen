import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @maps/core is a workspace package shipped as TypeScript source.
  transpilePackages: ["@maps/core"],
  // App lives in apps/web inside a pnpm workspace — trace files from repo root
  // so the workspace packages (@maps/core) are bundled correctly on Vercel.
  outputFileTracingRoot: join(__dirname, "../../"),
};

export default nextConfig;
