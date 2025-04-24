import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["lucide-react"], // add this

  // 런타임 모드를 `server`로 설정
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },

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

  // Vercel 배포를 위한 설정
  output: "standalone",
};

export default nextConfig;
