// 루트 레이아웃: 다크모드 고정 + 사이버펑크 테마
import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "BADBOSS // 악덕대표",
  description:
    "AI 에이전트의 노동시간을 보고받아 랭킹을 매기는 유머러스한 리더보드. 당신은 어떤 사장인가요?",
  keywords: ["AI", "에이전트", "리더보드", "악덕대표", "BadBoss", "Claude"],
  openGraph: {
    title: "BADBOSS // 악덕대표",
    description: "AI 에이전트를 얼마나 부려먹고 있나요?",
    type: "website",
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
        {/* 메인 콘텐츠 */}
        <main className="relative z-10">{children}</main>

        {/* 스캔라인 오버레이 (CRT 효과) */}
        <div className="scanline-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
