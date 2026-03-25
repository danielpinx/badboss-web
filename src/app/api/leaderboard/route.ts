// GET /api/leaderboard - 랭킹 조회 API
import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, checkRateLimit, RedisConnectionError } from "@/lib/redis";
import { getCurrentWeekStartKST, isValidDateString } from "@/lib/utils";
import { GET_RATE_LIMIT_PER_MINUTE } from "@/lib/constants";

export async function GET(request: NextRequest) {
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

    // 날짜 쿼리 파라미터 파싱 (기본값: 이번 주 화요일 KST)
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

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

    // 리더보드 데이터 조회
    const { agents, groups } = await getLeaderboard(date);

    return NextResponse.json({
      date,
      agents,
      groups,
    });
  } catch (error) {
    console.error("[GET /api/leaderboard] 오류:", error);

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
