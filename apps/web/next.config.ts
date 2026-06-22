import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["kevent.jprq.live"],
  images: {
    remotePatterns: [{ protocol: "http", hostname: "www.culture.go.kr" }],
  },
};

export default nextConfig;
