// ASCII 아트 타이틀 컴포넌트
"use client";

/**
 * 메인 페이지 상단 ASCII 아트 헤더.
 * 네온 그린 색상 + 글로우 효과를 적용한다.
 * 모바일에서는 축소된 버전을 보여준다.
 */
export function AsciiHeader() {
  return (
    <div className="flex justify-center py-4 md:py-6">
      {/* 데스크탑 버전 */}
      <pre
        className="hidden md:block text-neon-green font-mono text-xs lg:text-sm leading-tight select-none animate-glow"
        aria-label="BADBOSS ASCII Art"
      >
        {`
 ____    _    ____  ____   ___  ____ ____
| __ )  / \\  |  _ \\| __ ) / _ \\/ ___/ ___|
|  _ \\ / _ \\ | | | |  _ \\| | | \\___ \\___ \\
| |_) / ___ \\| |_| | |_) | |_| |___) |__) |
|____/_/   \\_\\____/|____/ \\___/|____/____/
        `.trim()}
      </pre>

      {/* 모바일 버전 */}
      <pre
        className="block md:hidden text-neon-green font-mono text-[10px] leading-tight select-none animate-glow"
        aria-label="BADBOSS ASCII Art"
      >
        {`
 ____   _   ____
| __ ) /_\\ |  _ \\
|  _ \\/ _ \\| | | |
| |_) / ___ | |_| |
|____/_/ \\_|____/
 ____   ___  ____ ____
| __ ) / _ \\/ ___/ ___|
|  _ \\| | | \\___ \\___ \\
| |_) | |_| |___) |__) |
|____/ \\___/|____/____/
        `.trim()}
      </pre>
    </div>
  );
}
