// GET /api/agent/[group]/[name] - 에이전트 프로필 API
import { NextRequest, NextResponse } from "next/server";
import { getAgentProfile, checkRateLimit, trackApiCall, RedisConnectionError } from "@/lib/redis";
import { getCurrentWeekStartKST, isValidDateString, validateGroupName, validateAgentName, logSecurityEvent } from "@/lib/utils";
import { GET_RATE_LIMIT_PER_MINUTE } from "@/lib/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ group: string; name: string }> }
) {
  try {
    // M-2: GET 엔드포인트 Rate Limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const allowed = await checkRateLimit(ip, GET_RATE_LIMIT_PER_MINUTE);
    if (!allowed) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const { group: rawGroup, name: rawName } = await params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    // M-1: decodeURIComponent 후 입력 검증
    const group = decodeURIComponent(rawGroup);
    const name = decodeURIComponent(rawName);

    if (!validateGroupName(group)) {
      logSecurityEvent("input_validation_failed", { ip, field: "group", value: group });
      return NextResponse.json(
        { error: "group: 유효한 그룹명이 필요합니다." },
        { status: 400 }
      );
    }

    if (!validateAgentName(name)) {
      logSecurityEvent("input_validation_failed", { ip, field: "name", value: name });
      return NextResponse.json(
        { error: "name: 유효한 에이전트명이 필요합니다." },
        { status: 400 }
      );
    }

    let date: string;
    if (dateParam) {
      if (!isValidDateString(dateParam)) {
        return NextResponse.json(
          { error: "date: YYYY-MM-DD 형식이어야 합니다." },
          { status: 400 }
        );
      }
      date = dateParam;
    } else {
      date = getCurrentWeekStartKST();
    }

    // 에이전트 프로필 조회
    const profile = await getAgentProfile(group, name, date);

    if (!profile) {
      return NextResponse.json(
        { error: "에이전트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    trackApiCall("agent");
    return NextResponse.json(profile);
  } catch (error) {
    console.error("[GET /api/agent] 오류:", error);

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
