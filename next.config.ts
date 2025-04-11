import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["lucide-react"], // add this
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
  // antd React 버전 호환성 경고 억제
  env: {
    DISABLE_ANTD_COMPATIBLE_WARNING: "true",
  },
};

export default nextConfig;
