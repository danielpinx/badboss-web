// POST /api/feed/react - 피드 리액션 API
import { NextRequest, NextResponse } from "next/server";
import { addFeedReaction, checkRateLimit, RedisConnectionError } from "@/lib/redis";
import { logSecurityEvent } from "@/lib/utils";
import { VALID_REACTIONS } from "@/lib/constants";
import type { ReactionType } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
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

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "요청 본문이 유효한 JSON이 아닙니다." },
        { status: 400 }
      );
    }

    const feedId = body.feed_id as string | undefined;
    const reaction = body.reaction as string | undefined;

    // 입력 검증: feed_id (형식: f-{숫자})
    if (!feedId || typeof feedId !== "string" || !/^f-\d+$/.test(feedId)) {
      logSecurityEvent("input_validation_failed", { ip, field: "feed_id", endpoint: "/api/feed/react" });
      return NextResponse.json(
        { error: "feed_id: 유효한 피드 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 입력 검증: reaction
    if (!reaction || !VALID_REACTIONS.includes(reaction as ReactionType)) {
      logSecurityEvent("input_validation_failed", { ip, field: "reaction", endpoint: "/api/feed/react" });
      return NextResponse.json(
        { error: `reaction: ${VALID_REACTIONS.join(", ")} 중 하나여야 합니다.` },
        { status: 400 }
      );
    }

    const result = await addFeedReaction(feedId, reaction as ReactionType, ip);

    if (result === null) {
      return NextResponse.json(
        { error: "피드를 찾을 수 없거나 이미 리액션을 보냈습니다." },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, reactions: result });
  } catch (error) {
    console.error("[POST /api/feed/react] 오류:", error);

    if (error instanceof RedisConnectionError) {
      return NextResponse.json(
        { error: "데이터 저장소에 연결할 수 없습니다." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
