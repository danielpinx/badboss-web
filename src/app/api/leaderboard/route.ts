// GET /api/leaderboard - 랭킹 조회 API
import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, RedisConnectionError } from "@/lib/redis";
import { getTodayKST, isValidDateString } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    // 날짜 쿼리 파라미터 파싱 (기본값: 오늘 KST)
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
      date = getTodayKST();
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
