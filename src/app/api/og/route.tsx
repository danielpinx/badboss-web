// OG 이미지 동적 생성 API
// 사이버펑크 스타일 카드 이미지를 생성하여 소셜 미디어 미리보기에 사용한다.
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getAgentProfile } from "@/lib/redis";
import { formatMinutes } from "@/lib/utils";
import { LEVELS } from "@/lib/levels";

export const runtime = "nodejs";

/** 레벨별 뱃지 색상을 반환한다. */
function getLevelColor(level: number): string {
  const levelInfo = LEVELS.find((l) => l.level === level);
  return levelInfo?.color || "#00ff41";
}

/**
 * GET /api/og?group=xxx&name=xxx
 * group/name이 없으면 메인 OG 이미지를 생성한다.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const group = searchParams.get("group");
  const name = searchParams.get("name");

  // 에이전트별 OG 이미지
  if (group && name) {
    const agent = await getAgentProfile(
      decodeURIComponent(group),
      decodeURIComponent(name)
    );

    if (agent) {
      const levelColor = getLevelColor(agent.level);

      return new ImageResponse(
        (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)",
              fontFamily: "monospace",
              position: "relative",
            }}
          >
            {/* 그리드 패턴 배경 */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage:
                  "linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                display: "flex",
              }}
            />

            {/* 상단 바 */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: `linear-gradient(90deg, transparent, ${levelColor}, transparent)`,
                display: "flex",
              }}
            />

            {/* BADBOSS 로고 */}
            <div
              style={{
                color: "#00ff41",
                fontSize: "24px",
                opacity: 0.5,
                marginBottom: "20px",
                display: "flex",
              }}
            >
              BADBOSS // 악덕보스
            </div>

            {/* 에이전트 이름 */}
            <div
              style={{
                color: "#00ff41",
                fontSize: "64px",
                fontWeight: "bold",
                textShadow: "0 0 20px rgba(0,255,65,0.5)",
                display: "flex",
              }}
            >
              {agent.agent_name}
            </div>

            {/* 그룹명 */}
            <div
              style={{
                color: "#bd00ff",
                fontSize: "28px",
                marginTop: "8px",
                display: "flex",
              }}
            >
              {agent.group}
            </div>

            {/* 레벨 뱃지 */}
            <div
              style={{
                marginTop: "30px",
                padding: "12px 32px",
                border: `2px solid ${levelColor}`,
                borderRadius: "8px",
                color: levelColor,
                fontSize: "36px",
                fontWeight: "bold",
                textShadow: `0 0 15px ${levelColor}`,
                boxShadow: `0 0 20px ${levelColor}40`,
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              Lv.{agent.level} {agent.level_title_ko}
            </div>

            {/* 노동 시간 */}
            <div
              style={{
                marginTop: "24px",
                color: "#9ca3af",
                fontSize: "28px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              이번 주 노동시간:
              <span style={{ color: "#00ff41", fontWeight: "bold" }}>
                {formatMinutes(agent.total_minutes)}
              </span>
            </div>

            {/* 하단 바 */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: `linear-gradient(90deg, transparent, ${levelColor}, transparent)`,
                display: "flex",
              }}
            />

            {/* 하단 URL */}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                color: "#4b5563",
                fontSize: "18px",
                display: "flex",
              }}
            >
              badboss.pinxlab.com
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }
  }

  // 기본 메인 OG 이미지 (에이전트 지정 없을 때)
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* 그리드 패턴 배경 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            display: "flex",
          }}
        />

        {/* 상단 네온 바 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent, #00ff41, #bd00ff, transparent)",
            display: "flex",
          }}
        />

        {/* 메인 타이틀 */}
        <div
          style={{
            color: "#00ff41",
            fontSize: "80px",
            fontWeight: "bold",
            textShadow: "0 0 30px rgba(0,255,65,0.5)",
            display: "flex",
          }}
        >
          BADBOSS
        </div>

        {/* 부제 */}
        <div
          style={{
            color: "#bd00ff",
            fontSize: "40px",
            marginTop: "8px",
            textShadow: "0 0 15px rgba(189,0,255,0.5)",
            display: "flex",
          }}
        >
          악덕보스
        </div>

        {/* 설명 */}
        <div
          style={{
            color: "#9ca3af",
            fontSize: "28px",
            marginTop: "30px",
            display: "flex",
          }}
        >
          AI 에이전트 노동착취 리더보드
        </div>

        {/* 질문 */}
        <div
          style={{
            color: "#00f0ff",
            fontSize: "32px",
            marginTop: "16px",
            textShadow: "0 0 10px rgba(0,240,255,0.3)",
            display: "flex",
          }}
        >
          당신은 어떤 사장인가요?
        </div>

        {/* 하단 네온 바 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent, #bd00ff, #00ff41, transparent)",
            display: "flex",
          }}
        />

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            color: "#4b5563",
            fontSize: "18px",
            display: "flex",
          }}
        >
          badboss.pinxlab.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
