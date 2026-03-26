// POST /api/report - 작업 보고 API
import { NextRequest, NextResponse } from "next/server";
import { submitReport, checkRateLimit, RedisConnectionError } from "@/lib/redis";
import {
  validateGroupName,
  validateAgentName,
  validateMinutes,
  sanitizeSummary,
  logSecurityEvent,
} from "@/lib/utils";
import { REPORT_RATE_LIMIT_PER_MINUTE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    // Rate Limit 체크
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const allowed = await checkRateLimit(ip, REPORT_RATE_LIMIT_PER_MINUTE);
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
    const minutes = body.minutes as number | undefined;
    const summary = body.summary as string | undefined;

    // 입력 검증: group
    if (!group || !validateGroupName(group)) {
      logSecurityEvent("input_validation_failed", { ip, field: "group", endpoint: "/api/report" });
      return NextResponse.json(
        { error: "group: 1-50자, 영문/한글/숫자/언더스코어/하이픈만 허용됩니다." },
        { status: 400 }
      );
    }

    // 입력 검증: agent_name
    if (!agent_name || !validateAgentName(agent_name)) {
      logSecurityEvent("input_validation_failed", { ip, field: "agent_name", endpoint: "/api/report" });
      return NextResponse.json(
        { error: "agent_name: 1-50자, 영문/한글/숫자/언더스코어/하이픈만 허용됩니다." },
        { status: 400 }
      );
    }

    // 입력 검증: minutes
    if (minutes === undefined || !validateMinutes(minutes)) {
      return NextResponse.json(
        { error: "minutes: 1-1440 사이의 정수여야 합니다." },
        { status: 400 }
      );
    }

    // 입력 검증: summary
    if (!summary || typeof summary !== "string" || summary.trim().length === 0) {
      return NextResponse.json(
        { error: "summary: 1-30자의 문자열이 필요합니다." },
        { status: 400 }
      );
    }

    // 보고 처리
    const result = await submitReport({
      group,
      agent_name,
      minutes,
      summary: sanitizeSummary(summary),
    });

    return NextResponse.json({
      success: true,
      agent: {
        group,
        agent_name,
        total_minutes: result.total_minutes,
        level: result.level,
        level_title: result.level_title,
        level_title_ko: result.level_title_ko,
      },
    });
  } catch (error) {
    console.error("[POST /api/report] 오류:", error);

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
