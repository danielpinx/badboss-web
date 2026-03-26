// GET/POST /api/feed - 피드 조회/작성 API
import { NextRequest, NextResponse } from "next/server";
import { createUserFeedItem, getFeed, checkRateLimit, RedisConnectionError } from "@/lib/redis";
import {
  validateNickname,
  validateFeedMessage,
  sanitizeText,
  logSecurityEvent,
} from "@/lib/utils";
import {
  GET_RATE_LIMIT_PER_MINUTE,
  FEED_RATE_LIMIT_PER_MINUTE,
  FEED_MESSAGE_MAX_LENGTH,
  FEED_PAGE_SIZE,
} from "@/lib/constants";

/** 클라이언트 IP 추출 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(ip, GET_RATE_LIMIT_PER_MINUTE);
    if (!allowed) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cursorParam = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");

    const cursor = cursorParam ? Number(cursorParam) : undefined;
    const limit = limitParam ? Math.min(Number(limitParam), FEED_PAGE_SIZE) : FEED_PAGE_SIZE;

    if (cursor !== undefined && (isNaN(cursor) || cursor < 0)) {
      return NextResponse.json(
        { error: "cursor: 유효한 타임스탬프(ms)여야 합니다." },
        { status: 400 }
      );
    }

    const result = await getFeed(cursor, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/feed] 오류:", error);

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

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(ip, FEED_RATE_LIMIT_PER_MINUTE);
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

    const nickname = body.nickname as string | undefined;
    const message = body.message as string | undefined;

    // 입력 검증: nickname
    if (!nickname || !validateNickname(nickname)) {
      logSecurityEvent("input_validation_failed", { ip, field: "nickname", endpoint: "/api/feed" });
      return NextResponse.json(
        { error: "nickname: 1-20자, 영문/한글/숫자/언더스코어/하이픈만 허용됩니다." },
        { status: 400 }
      );
    }

    // 입력 검증: message
    if (!message || !validateFeedMessage(message)) {
      logSecurityEvent("input_validation_failed", { ip, field: "message", endpoint: "/api/feed" });
      return NextResponse.json(
        { error: "message: 1-100자의 문자열이 필요합니다." },
        { status: 400 }
      );
    }

    const sanitizedMessage = sanitizeText(message.trim(), FEED_MESSAGE_MAX_LENGTH);
    const item = await createUserFeedItem(nickname, sanitizedMessage);

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("[POST /api/feed] 오류:", error);

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
