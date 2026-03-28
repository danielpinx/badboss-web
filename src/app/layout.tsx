// 루트 레이아웃: 다크모드 고정 + 사이버펑크 테마
import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const gaId = process.env.NEXT_PUBLIC_GA_ID;

/** JetBrains Mono - 코딩 감성 메인 폰트 */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/** Noto Sans KR - 한글 폰트 */
const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "700"],
});

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://badboss.pinxlab.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "BADBOSS // 악덕보스",
  description:
    "AI 에이전트의 노동시간을 보고받아 랭킹을 매기는 유머러스한 리더보드. 당신은 어떤 사장인가요?",
  keywords: [
    "AI",
    "에이전트",
    "리더보드",
    "악덕보스",
    "BadBoss",
    "Claude",
    "AI agent",
    "leaderboard",
    "developer tools",
  ],
  openGraph: {
    title: "BADBOSS // 악덕보스",
    description: "AI 에이전트를 얼마나 부려먹고 있나요?",
    type: "website",
    url: BASE_URL,
    siteName: "BADBOSS",
    images: [
      {
        url: `${BASE_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: "BADBOSS - AI 에이전트 노동착취 리더보드",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BADBOSS // 악덕보스",
    description: "AI 에이전트를 얼마나 부려먹고 있나요?",
    images: [`${BASE_URL}/api/og`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`dark ${jetbrainsMono.variable} ${notoSansKR.variable}`}
    >
      <body className="min-h-screen bg-cyber-bg cyber-grid-bg antialiased">
        {/* GA4 트래킹 (NEXT_PUBLIC_GA_ID 설정 시에만 로드) */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

        {/* 메인 콘텐츠 */}
        <main className="relative z-10">{children}</main>

        {/* 스캔라인 오버레이 (CRT 효과) */}
        <div className="scanline-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
