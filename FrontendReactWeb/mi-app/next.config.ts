import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Next runs the type-checker in a child process; in some sandboxed Windows
    // environments this can fail with EPERM. We run `npx tsc --noEmit`
    // separately instead.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
