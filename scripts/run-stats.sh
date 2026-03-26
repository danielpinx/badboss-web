#!/bin/bash
# BadBoss API 통계 조회 스크립트
# 사용법: ./scripts/run-stats.sh [today|week|date YYYY-MM-DD]

set -euo pipefail

REDIS_CLI="redis-cli"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASS="${REDIS_PASSWORD:-}"

# Redis CLI 옵션 구성
redis_cmd() {
  local args=(-h "$REDIS_HOST" -p "$REDIS_PORT")
  if [ -n "$REDIS_PASS" ]; then
    args+=(-a "$REDIS_PASS" --no-auth-warning)
  fi
  $REDIS_CLI "${args[@]}" "$@"
}

# Redis 연결 확인
check_redis() {
  if ! redis_cmd ping &>/dev/null; then
    echo "[오류] Redis에 연결할 수 없습니다. ($REDIS_HOST:$REDIS_PORT)"
    exit 1
  fi
}

# 엔드포인트 목록
ENDPOINTS=("report" "leaderboard" "react" "feed" "feed-post" "feed-react" "agent")

# 특정 날짜의 통계 출력
print_day_stats() {
  local date="$1"
  local total=0

  printf "%-14s %8s\n" "엔드포인트" "호출 수"
  printf "%-14s %8s\n" "--------------" "--------"

  for ep in "${ENDPOINTS[@]}"; do
    local count
    count=$(redis_cmd GET "stats:api:${ep}:${date}" 2>/dev/null || echo "0")
    count="${count:-0}"
    if [ "$count" = "" ]; then count=0; fi
    total=$((total + count))
    printf "%-14s %8s\n" "$ep" "$count"
  done

  printf "%-14s %8s\n" "--------------" "--------"
  printf "%-14s %8s\n" "합계" "$total"
}

# 주간 통계 출력 (최근 7일)
print_week_stats() {
  local total_all=0

  printf "%-12s" "날짜"
  for ep in "${ENDPOINTS[@]}"; do
    printf " %10s" "$ep"
  done
  printf " %10s\n" "합계"

  printf "%-12s" "------------"
  for _ in "${ENDPOINTS[@]}"; do
    printf " %10s" "----------"
  done
  printf " %10s\n" "----------"

  for i in $(seq 6 -1 0); do
    local date
    date=$(date -v-${i}d +%Y-%m-%d 2>/dev/null || date -d "-${i} days" +%Y-%m-%d)
    local day_total=0

    printf "%-12s" "$date"
    for ep in "${ENDPOINTS[@]}"; do
      local count
      count=$(redis_cmd GET "stats:api:${ep}:${date}" 2>/dev/null || echo "0")
      count="${count:-0}"
      if [ "$count" = "" ]; then count=0; fi
      day_total=$((day_total + count))
      printf " %10s" "$count"
    done
    total_all=$((total_all + day_total))
    printf " %10s\n" "$day_total"
  done

  printf "%-12s" "------------"
  for _ in "${ENDPOINTS[@]}"; do
    printf " %10s" "----------"
  done
  printf " %10s\n" "----------"
  printf "%-12s" "주간 합계"
  # 엔드포인트별 주간 합계
  for ep in "${ENDPOINTS[@]}"; do
    local ep_total=0
    for i in $(seq 6 -1 0); do
      local date
      date=$(date -v-${i}d +%Y-%m-%d 2>/dev/null || date -d "-${i} days" +%Y-%m-%d)
      local count
      count=$(redis_cmd GET "stats:api:${ep}:${date}" 2>/dev/null || echo "0")
      count="${count:-0}"
      if [ "$count" = "" ]; then count=0; fi
      ep_total=$((ep_total + count))
    done
    printf " %10s" "$ep_total"
  done
  printf " %10s\n" "$total_all"
}

# 사용법 출력
usage() {
  echo "BadBoss API 통계 조회"
  echo ""
  echo "사용법: $0 [명령]"
  echo ""
  echo "명령:"
  echo "  today           오늘 통계 (기본값)"
  echo "  week            최근 7일 통계"
  echo "  date YYYY-MM-DD 특정 날짜 통계"
  echo ""
  echo "환경변수:"
  echo "  REDIS_HOST      Redis 호스트 (기본: localhost)"
  echo "  REDIS_PORT      Redis 포트 (기본: 6379)"
  echo "  REDIS_PASSWORD   Redis 비밀번호"
}

# 메인
main() {
  check_redis

  local cmd="${1:-today}"

  case "$cmd" in
    today)
      local today
      today=$(date +%Y-%m-%d)
      echo "=== BadBoss API 통계: $today ==="
      echo ""
      print_day_stats "$today"
      ;;
    week)
      echo "=== BadBoss API 통계: 최근 7일 ==="
      echo ""
      print_week_stats
      ;;
    date)
      local target_date="${2:-}"
      if [ -z "$target_date" ]; then
        echo "[오류] 날짜를 입력해주세요. (예: $0 date 2026-03-26)"
        exit 1
      fi
      if [[ ! "$target_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        echo "[오류] 날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)"
        exit 1
      fi
      echo "=== BadBoss API 통계: $target_date ==="
      echo ""
      print_day_stats "$target_date"
      ;;
    -h|--help|help)
      usage
      ;;
    *)
      echo "[오류] 알 수 없는 명령: $cmd"
      usage
      exit 1
      ;;
  esac
}

main "$@"
