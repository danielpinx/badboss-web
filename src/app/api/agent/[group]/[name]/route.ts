// GET /api/agent/[group]/[name] - 에이전트 프로필 API
import { NextRequest, NextResponse } from "next/server";
import { getAgentProfile, RedisConnectionError } from "@/lib/redis";
import { getTodayKST, isValidDateString } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ group: string; name: string }> }
) {
  try {
    const { group, name } = await params;
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

    // 에이전트 프로필 조회
    const profile = await getAgentProfile(
      decodeURIComponent(group),
      decodeURIComponent(name),
      date
    );

    if (!profile) {
      return NextResponse.json(
        { error: "에이전트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

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
