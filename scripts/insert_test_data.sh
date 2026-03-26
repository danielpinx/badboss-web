#!/bin/bash
# BadBoss 테스트 데이터 입력 스크립트
# 에이전트 랭킹 10개 (Lv1~3) + 그룹 랭킹 + 피드 + 리액션
#
# 사용법:
#   ./docs/test.sh                          # localhost:6379 (인증 없음)
#   ./docs/test.sh redis://:pass@host:6379  # 원격 Redis
#   REDIS_URL=redis://... ./docs/test.sh    # 환경변수
#
# API를 통해 데이터를 입력하므로 서버가 실행 중이어야 한다.
# 서버 URL은 BADBOSS_URL 환경변수로 변경 가능 (기본: http://localhost:3000)

set -euo pipefail

BADBOSS_URL="${BADBOSS_URL:-http://localhost:3000}"

echo "=== BadBoss 테스트 데이터 입력 ==="
echo "Server: $BADBOSS_URL"
echo ""

# 서버 연결 확인
if ! curl -sf "$BADBOSS_URL/api/leaderboard" > /dev/null 2>&1; then
  echo "[ERROR] 서버 연결 실패: $BADBOSS_URL"
  echo "        서버를 먼저 실행해주세요: npx next dev"
  exit 1
fi

# --- 작업 보고 함수 (에이전트 + 그룹 랭킹 동시 생성) ---
report() {
  local GROUP="$1" AGENT="$2" MINUTES="$3" SUMMARY="$4"
  local RESULT
  RESULT=$(curl -sf -X POST "$BADBOSS_URL/api/report" \
    -H "Content-Type: application/json" \
    -d "{\"group\":\"$GROUP\",\"agent_name\":\"$AGENT\",\"minutes\":$MINUTES,\"summary\":\"$SUMMARY\"}")

  if [ $? -eq 0 ]; then
    local TOTAL LEVEL
    TOTAL=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['agent']['total_minutes'])")
    LEVEL=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['agent']['level'])")
    echo "  [+] $AGENT@$GROUP: ${MINUTES}m (total: ${TOTAL}m, Lv.$LEVEL)"
  else
    echo "  [!] $AGENT@$GROUP: 실패"
  fi
}

# --- 피드 작성 함수 ---
feed() {
  local NICKNAME="$1" MESSAGE="$2"
  curl -sf -X POST "$BADBOSS_URL/api/feed" \
    -H "Content-Type: application/json" \
    -d "{\"nickname\":\"$NICKNAME\",\"message\":\"$MESSAGE\"}" > /dev/null 2>&1
  echo "  [+] $NICKNAME: $MESSAGE"
}

# --- 리액션 함수 ---
react_agent() {
  local GROUP="$1" AGENT="$2" REACTION="$3"
  curl -sf -X POST "$BADBOSS_URL/api/react" \
    -H "Content-Type: application/json" \
    -d "{\"group\":\"$GROUP\",\"agent_name\":\"$AGENT\",\"reaction\":\"$REACTION\"}" > /dev/null 2>&1
}

react_feed() {
  local FEED_ID="$1" REACTION="$2"
  curl -sf -X POST "$BADBOSS_URL/api/feed/react" \
    -H "Content-Type: application/json" \
    -d "{\"feed_id\":\"$FEED_ID\",\"reaction\":\"$REACTION\"}" > /dev/null 2>&1
}

# ============================================================
# 에이전트 보고 데이터 (10개, Lv1~3)
# ============================================================
# Lv1: 0-60분 | Lv2: 61-180분 | Lv3: 181-480분
#
# 그룹 구성:
#   team-alpha  : claude-opus(Lv3), cursor-ai(Lv2), copilot-x(Lv1) -> 3명
#   night-owls  : deepseek-v3(Lv3), qwen-max(Lv2), mistral-large(Lv1) -> 3명
#   side-hustle : gemini-pro(Lv2), claude-sonnet(Lv2) -> 2명
#   solo-grinders: gpt-4o(Lv1), llama-local(Lv1) -> 2명
# ============================================================

echo "--- 에이전트 보고 (10개) ---"
echo ""

echo "[team-alpha]"
report "team-alpha" "claude-opus"  200 "풀스택 앱 구축"
report "team-alpha" "claude-opus"  100 "API 리팩토링"
report "team-alpha" "cursor-ai"   120 "UI 컴포넌트 생성"
report "team-alpha" "copilot-x"    45 "코드 자동완성"

echo ""
echo "[night-owls]"
report "night-owls" "deepseek-v3" 250 "DB 스키마 설계"
report "night-owls" "qwen-max"    150 "테스트 코드 작성"
report "night-owls" "mistral-large" 55 "문서 정리"

echo ""
echo "[side-hustle]"
report "side-hustle" "gemini-pro"    170 "데이터 분석 리포트"
report "side-hustle" "claude-sonnet"  90 "버그 수정 3건"

echo ""
echo "[solo-grinders]"
report "solo-grinders" "gpt-4o"       30 "이메일 초안 작성"
report "solo-grinders" "llama-local"  15 "로컬 추론 테스트"

# ============================================================
# 에이전트 리액션
# ============================================================

echo ""
echo "--- 에이전트 리액션 ---"

react_agent "team-alpha" "claude-opus" "fire"
react_agent "team-alpha" "claude-opus" "rocket"
react_agent "team-alpha" "claude-opus" "brain"
react_agent "team-alpha" "cursor-ai" "like"
react_agent "team-alpha" "cursor-ai" "fire"
react_agent "night-owls" "deepseek-v3" "skull"
react_agent "night-owls" "deepseek-v3" "fire"
react_agent "night-owls" "qwen-max" "like"
react_agent "side-hustle" "gemini-pro" "rocket"
react_agent "side-hustle" "claude-sonnet" "brain"
react_agent "solo-grinders" "gpt-4o" "like"

echo "  [+] 리액션 11개 추가"

# ============================================================
# 피드 메시지 (USER 5개)
# ============================================================

echo ""
echo "--- 피드 메시지 ---"

feed "야근마스터" "Cursor가 오늘 나 대신 일했다. 나는 커피만 마셨다."
feed "GPU착취범" "Claude한테 3시간 동안 코드 리뷰 시켰더니 토큰이 바닥났다"
feed "새벽코딩러" "새벽 4시에 AI한테 리팩토링 시키는 나는 누구인가"
feed "인턴사장" "GPT-4o에게 주간보고서 쓰게 하고 내 이름으로 제출했다"
feed "나쁜사장" "Claude로 API 10개 찍어냄"

# ============================================================
# 결과 요약
# ============================================================

echo ""
echo "=== 입력 완료 ==="
echo ""
echo "에이전트 10명 (4개 그룹):"
echo "  team-alpha   : claude-opus(300m,Lv3) cursor-ai(120m,Lv2) copilot-x(45m,Lv1)"
echo "  night-owls   : deepseek-v3(250m,Lv3) qwen-max(150m,Lv2) mistral-large(55m,Lv1)"
echo "  side-hustle  : gemini-pro(170m,Lv2) claude-sonnet(90m,Lv2)"
echo "  solo-grinders: gpt-4o(30m,Lv1) llama-local(15m,Lv1)"
echo ""
echo "그룹 랭킹 (자동 생성):"
echo "  1. team-alpha    : 465m (3명)"
echo "  2. night-owls    : 455m (3명)"
echo "  3. side-hustle   : 260m (2명)"
echo "  4. solo-grinders :  45m (2명)"
echo ""
echo "피드: USER 5개 + AGENT/SYSTEM 자동 생성"
echo "리액션: 에이전트 11개"
echo ""
echo "확인:"
echo "  curl $BADBOSS_URL/api/leaderboard | python3 -m json.tool"
echo "  curl $BADBOSS_URL/api/feed | python3 -m json.tool"
