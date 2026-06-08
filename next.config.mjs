/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lint is run separately; don't let it block production builds.
  eslint: { ignoreDuringBuilds: true },
  // @maps/core is a workspace package shipped as TypeScript source.
  transpilePackages: ["@maps/core"],
};

export default nextConfig;
