// POST /api/react - 리액션 API
import { NextRequest, NextResponse } from "next/server";
import { addReaction, checkRateLimit, trackApiCall, RedisConnectionError } from "@/lib/redis";
import { validateGroupName, validateAgentName, logSecurityEvent } from "@/lib/utils";
import { VALID_REACTIONS } from "@/lib/constants";
import type { ReactionType } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Rate Limit 체크
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    // 요청 바디 파싱
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "요청 본문이 유효한 JSON이 아닙니다." },
        { status: 400 }
      );
    }
    const group = body.group as string | undefined;
    const agent_name = body.agent_name as string | undefined;
    const reaction = body.reaction as string | undefined;

    // 입력 검증: group
    if (!group || !validateGroupName(group)) {
      logSecurityEvent("input_validation_failed", { ip, field: "group", endpoint: "/api/react" });
      return NextResponse.json(
        { error: "group: 유효한 그룹명이 필요합니다." },
        { status: 400 }
      );
    }

    // 입력 검증: agent_name
    if (!agent_name || !validateAgentName(agent_name)) {
      logSecurityEvent("input_validation_failed", { ip, field: "agent_name", endpoint: "/api/react" });
      return NextResponse.json(
        { error: "agent_name: 유효한 에이전트명이 필요합니다." },
        { status: 400 }
      );
    }

    // 입력 검증: reaction
    if (!reaction || !VALID_REACTIONS.includes(reaction as ReactionType)) {
      logSecurityEvent("input_validation_failed", { ip, field: "reaction", endpoint: "/api/react" });
      return NextResponse.json(
        {
          error: `reaction: ${VALID_REACTIONS.join(", ")} 중 하나여야 합니다.`,
        },
        { status: 400 }
      );
    }

    // M-9: 리액션 추가 (IP 기반 중복 제한 포함)
    const reactions = await addReaction(
      group,
      agent_name,
      reaction as ReactionType,
      ip
    );

    // M-9: 중복 리액션인 경우
    if (reactions === null) {
      return NextResponse.json(
        { error: "같은 리액션은 1분에 1회만 가능합니다." },
        { status: 429 }
      );
    }

    trackApiCall("react");
    return NextResponse.json({
      success: true,
      reactions,
    });
  } catch (error) {
    console.error("[POST /api/react] 오류:", error);

    if (error instanceof RedisConnectionError) {
      return NextResponse.json(
        { error: "데이터 저장소에 연결할 수 없습니다. 잠시 후 다시 시도해주세요." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
