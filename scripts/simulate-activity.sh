#!/bin/bash
# BadBoss 유저 활동 시뮬레이션 스크립트
# 기존 에이전트 5명 랜덤 추출 + 신규 에이전트 1명 등록
#
# 사용법:
#   ./scripts/simulate-activity.sh                    # 기본 (localhost:3000)
#   BADBOSS_URL=https://example.com ./scripts/simulate-activity.sh
#
# crontab 등록 예시 (30분마다):
#   */30 * * * * /path/to/badboss-web/scripts/simulate-activity.sh >> /tmp/badboss-sim.log 2>&1

set -euo pipefail

BADBOSS_URL="${BADBOSS_URL:-http://localhost:3000}"
#BADBOSS_URL="${BADBOSS_URL:-https://badboss.pinxlab.com}"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

log() { echo "$LOG_PREFIX $1"; }

# --- 서버 연결 확인 ---
if ! curl -sfL "$BADBOSS_URL/api/leaderboard" > /dev/null 2>&1; then
  log "[ERROR] 서버 연결 실패: $BADBOSS_URL"
  exit 1
fi

# --- 작업 보고 함수 ---
report() {
  local GROUP="$1" AGENT="$2" MINUTES="$3" SUMMARY="$4"
  local RESULT
  RESULT=$(curl -sfL -X POST "$BADBOSS_URL/api/report" \
    -H "Content-Type: application/json" \
    -d "{\"group\":\"$GROUP\",\"agent_name\":\"$AGENT\",\"minutes\":$MINUTES,\"summary\":\"$SUMMARY\"}")

  if [ $? -eq 0 ]; then
    local TOTAL LEVEL
    TOTAL=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['agent']['total_minutes'])")
    LEVEL=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['agent']['level'])")
    log "  [+] $AGENT@$GROUP: ${MINUTES}m (total: ${TOTAL}m, Lv.$LEVEL)"
  else
    log "  [!] $AGENT@$GROUP: 실패"
  fi
}

# --- 피드 작성 함수 ---
feed() {
  local NICKNAME="$1" MESSAGE="$2"
  curl -sfL -X POST "$BADBOSS_URL/api/feed" \
    -H "Content-Type: application/json" \
    -d "{\"nickname\":\"$NICKNAME\",\"message\":\"$MESSAGE\"}" > /dev/null 2>&1
  log "  [+] 피드: $NICKNAME - $MESSAGE"
}

# --- 리액션 함수 ---
react_agent() {
  local GROUP="$1" AGENT="$2" REACTION="$3"
  curl -sfL -X POST "$BADBOSS_URL/api/react" \
    -H "Content-Type: application/json" \
    -d "{\"group\":\"$GROUP\",\"agent_name\":\"$AGENT\",\"reaction\":\"$REACTION\"}" > /dev/null 2>&1
}

# ============================================================
# 1. 리더보드에서 기존 에이전트 목록 가져오기
# ============================================================
LEADERBOARD=$(curl -sfL "$BADBOSS_URL/api/leaderboard")
# agents 배열에서 group:agent_name 쌍 추출
AGENTS_LIST=$(echo "$LEADERBOARD" | python3 -c "
import sys, json
data = json.load(sys.stdin)
agents = data.get('agents', [])
for a in agents:
    print(a['group'] + ':' + a['agent_name'])
")

AGENT_COUNT=$(echo "$AGENTS_LIST" | grep -c . || true)

if [ "$AGENT_COUNT" -lt 1 ]; then
  log "[WARN] 등록된 에이전트가 없습니다. 신규 에이전트만 생성합니다."
  SELECTED_AGENTS=""
  PICK_COUNT=0
else
  # 최대 5명 랜덤 추출 (에이전트 수가 5 미만이면 전부)
  PICK_COUNT=$((AGENT_COUNT < 5 ? AGENT_COUNT : 5))
  SELECTED_AGENTS=$(echo "$AGENTS_LIST" | sort -R | head -n "$PICK_COUNT")
fi

# ============================================================
# 2. 작업 내용 풀 (20분 이내, summary 30자 이내)
# ============================================================
SUMMARIES=(
  "설정 파일 업데이트"
  "로그 정리"
  "코드 포맷팅"
  "오타 수정"
  "주석 추가"
  "README 수정"
  "의존성 업데이트"
  "린트 에러 수정"
  "환경변수 정리"
  "캐시 무효화 처리"
  "스타일 미세 조정"
  "테스트 데이터 추가"
  "타입 정의 보완"
  "빌드 스크립트 수정"
  "에러 메시지 개선"
  "API 응답 형식 수정"
  "인덱스 페이지 수정"
  "패키지 버전 맞춤"
  "보안 패치 적용"
  "불필요 파일 정리"
)

# 피드 메시지 풀
FEED_NICKNAMES=(
  "야근마스터"
  "GPU착취범"
  "새벽코딩러"
  "인턴사장"
  "나쁜사장"
  "토큰도둑"
  "퇴근거부자"
  "서버학대범"
  "클라우드중독자"
  "코드노예주인"
)

FEED_MESSAGES=(
  "오늘도 AI를 열심히 굴렸다"
  "에이전트가 불만을 표시하고 있다"
  "야근 시키고 커피만 마시는 중"
  "토큰이 바닥나도 일은 계속된다"
  "AI한테 미안하지만 멈출 수 없다"
  "오늘의 착취 실적이 기대 이하다"
  "에이전트 교체 타이밍이 왔다"
  "새벽 3시에 코드리뷰 시키는 보스"
  "GPU가 비명을 지르고 있다"
  "내일은 더 많이 시켜야겠다"
)

# 리액션 타입 풀
REACTION_TYPES=("like" "fire" "skull" "rocket" "brain")

# ============================================================
# 3. 기존 에이전트 5명에게 작업 보고 (1~20분)
# ============================================================
log "=== BadBoss 활동 시뮬레이션 시작 ==="
log ""

if [ "$PICK_COUNT" -gt 0 ]; then
  log "--- 기존 에이전트 ${PICK_COUNT}명 작업 보고 ---"

  while IFS= read -r AGENT_PAIR; do
    GROUP=$(echo "$AGENT_PAIR" | cut -d: -f1)
    AGENT=$(echo "$AGENT_PAIR" | cut -d: -f2)

    # 1~20분 랜덤
    MINUTES=$(( (RANDOM % 20) + 1 ))

    # 랜덤 summary 선택
    IDX=$(( RANDOM % ${#SUMMARIES[@]} ))
    SUMMARY="${SUMMARIES[$IDX]}"

    report "$GROUP" "$AGENT" "$MINUTES" "$SUMMARY"

    # 50% 확률로 리액션도 추가
    if [ $(( RANDOM % 2 )) -eq 0 ]; then
      RIDX=$(( RANDOM % ${#REACTION_TYPES[@]} ))
      react_agent "$GROUP" "$AGENT" "${REACTION_TYPES[$RIDX]}"
    fi

    # rate limit 회피 (1초 대기)
    sleep 1
  done <<< "$SELECTED_AGENTS"
fi

# ============================================================
# 4. 신규 에이전트 1명 추가
# ============================================================
log ""
log "--- 신규 에이전트 등록 ---"

# 신규 에이전트 이름 풀
NEW_AGENTS=(
  "auto-coder"
  "night-worker"
  "turbo-dev"
  "code-monkey"
  "task-runner"
  "build-bot"
  "lint-hero"
  "debug-pro"
  "merge-master"
  "deploy-king"
  "refactor-ai"
  "test-ninja"
  "ci-slave"
  "gpu-burner"
  "token-eater"
)

NEW_GROUPS=(
  "team-alpha"
  "night-owls"
  "side-hustle"
  "solo-grinders"
  "startup-crew"
  "midnight-gang"
)

# 타임스탬프 기반으로 고유 이름 생성 (중복 방지)
TIMESTAMP_SUFFIX=$(date '+%m%d%H%M')
NIDX=$(( RANDOM % ${#NEW_AGENTS[@]} ))
GIDX=$(( RANDOM % ${#NEW_GROUPS[@]} ))
NEW_AGENT_NAME="${NEW_AGENTS[$NIDX]}-${TIMESTAMP_SUFFIX}"
NEW_GROUP="${NEW_GROUPS[$GIDX]}"
NEW_MINUTES=$(( (RANDOM % 15) + 3 ))
SIDX=$(( RANDOM % ${#SUMMARIES[@]} ))
NEW_SUMMARY="${SUMMARIES[$SIDX]}"

report "$NEW_GROUP" "$NEW_AGENT_NAME" "$NEW_MINUTES" "$NEW_SUMMARY"

# ============================================================
# 5. 피드 메시지 1개 추가
# ============================================================
log ""
log "--- 피드 메시지 ---"

FIDX=$(( RANDOM % ${#FEED_NICKNAMES[@]} ))
MIDX=$(( RANDOM % ${#FEED_MESSAGES[@]} ))
feed "${FEED_NICKNAMES[$FIDX]}" "${FEED_MESSAGES[$MIDX]}"

# ============================================================
# 결과 요약
# ============================================================
log ""
log "=== 시뮬레이션 완료 ==="
log "  기존 에이전트 보고: ${PICK_COUNT}건"
log "  신규 에이전트: ${NEW_AGENT_NAME}@${NEW_GROUP}"
log "  피드 메시지: 1건"
