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

  // webpack 설정: markdown 파일을 문자열로 import
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });
    return config;
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

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
