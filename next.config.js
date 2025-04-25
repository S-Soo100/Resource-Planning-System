/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  transpilePackages: ["lucide-react"],

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

module.exports = nextConfig;
