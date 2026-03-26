import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,

  // HTTP 보안 헤더 설정
  async headers() {
    // CORS origin: 환경변수로 분기 (H-1: 기본값 없음, 반드시 명시적 설정 필요)
    const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:3000";
    // 개발 환경에서는 HMR을 위해 unsafe-eval 허용, 프로덕션에서는 제거
    const isDev = process.env.NODE_ENV === "development";
    // GA4 사용 시 googletagmanager.com 도메인 허용
    const gaHost = process.env.NEXT_PUBLIC_GA_ID
      ? " https://www.googletagmanager.com https://www.google-analytics.com"
      : "";
    const scriptSrc = isDev
      ? `script-src 'self' 'unsafe-inline' 'unsafe-eval'${gaHost}`
      : `script-src 'self' 'unsafe-inline'${gaHost}`;
    const connectSrc = process.env.NEXT_PUBLIC_GA_ID
      ? "connect-src 'self' https://www.google-analytics.com https://analytics.google.com"
      : "connect-src 'self'";

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // H-2: HSTS 헤더
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // H-2: Content-Security-Policy (Next.js 호환)
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com; font-src 'self' data:; ${connectSrc};`,
          },
          // H-2: Cross-Origin-Opener-Policy
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          // H-2: Cross-Origin-Embedder-Policy (credentialless: 폰트 로딩 호환)
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
        ],
      },
      {
        // API 라우트에 CORS 헤더 추가 (curl 지원)
        source: "/api/:path*",
        headers: [
          {
            // H-1: 환경변수로 CORS origin 분기
            key: "Access-Control-Allow-Origin",
            value: allowedOrigin,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
