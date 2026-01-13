import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile Clerk packages for Edge Runtime compatibility
  transpilePackages: ["@clerk/nextjs", "@clerk/shared"],

  // External packages that should not be bundled
  serverExternalPackages: ["@clerk/backend"],
};

export default nextConfig;
