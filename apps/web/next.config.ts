import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    // Avatar hosts used by the OAuth providers. next/image refuses any remote
    // host that isn't listed here, so a new provider needs a new entry.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
