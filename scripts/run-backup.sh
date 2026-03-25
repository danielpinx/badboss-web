#!/bin/bash
# BadBoss Redis 백업 스크립트
# 사용법: ./scripts/run-backup.sh [dump|restore|export|keys]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

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
  echo "[확인] Redis 연결 성공"
}

MODE="${1:-dump}"

case "$MODE" in
  dump)
    echo "=== BadBoss Redis RDB 백업 ==="
    check_redis
    mkdir -p "$BACKUP_DIR"

    # BGSAVE 실행
    redis_cmd BGSAVE
    echo "[대기] BGSAVE 실행 중..."
    sleep 2

    # RDB 파일 위치 확인 및 복사
    RDB_DIR="$(redis_cmd CONFIG GET dir | tail -1)"
    RDB_FILE="$(redis_cmd CONFIG GET dbfilename | tail -1)"
    RDB_PATH="$RDB_DIR/$RDB_FILE"

    if [ -f "$RDB_PATH" ]; then
      DEST="$BACKUP_DIR/dump_${TIMESTAMP}.rdb"
      cp "$RDB_PATH" "$DEST"
      echo "[완료] 백업 저장: $DEST"
      echo "[크기] $(du -h "$DEST" | cut -f1)"
    else
      echo "[오류] RDB 파일을 찾을 수 없습니다: $RDB_PATH"
      exit 1
    fi
    ;;
  restore)
    RESTORE_FILE="${2:-}"
    if [ -z "$RESTORE_FILE" ]; then
      echo "사용법: $0 restore <rdb 파일 경로>"
      echo ""
      echo "사용 가능한 백업:"
      ls -lh "$BACKUP_DIR"/*.rdb 2>/dev/null || echo "  (백업 파일 없음)"
      exit 1
    fi

    if [ ! -f "$RESTORE_FILE" ]; then
      echo "[오류] 파일을 찾을 수 없습니다: $RESTORE_FILE"
      exit 1
    fi

    echo "=== BadBoss Redis 복원 ==="
    echo "[주의] 현재 데이터가 덮어씌워집니다."
    read -rp "계속하시겠습니까? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
      echo "[취소] 복원이 취소되었습니다."
      exit 0
    fi

    check_redis
    RDB_DIR="$(redis_cmd CONFIG GET dir | tail -1)"
    RDB_FILE="$(redis_cmd CONFIG GET dbfilename | tail -1)"

    redis_cmd SHUTDOWN NOSAVE 2>/dev/null || true
    cp "$RESTORE_FILE" "$RDB_DIR/$RDB_FILE"
    echo "[완료] RDB 복사 완료. Redis를 재시작하세요."
    ;;
  export)
    echo "=== BadBoss Redis 데이터 JSON 내보내기 ==="
    check_redis
    mkdir -p "$BACKUP_DIR"

    DEST="$BACKUP_DIR/export_${TIMESTAMP}.json"

    # 리더보드 키 수집 및 JSON 생성
    {
      echo "{"
      echo "  \"exported_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
      echo "  \"keys\": {"

      FIRST=true
      for key in $(redis_cmd KEYS "leaderboard:*" "reports:*" "agent:*" "reaction:*" 2>/dev/null); do
        TYPE="$(redis_cmd TYPE "$key" | tr -d '[:space:]')"
        if [ "$FIRST" = true ]; then FIRST=false; else echo ","; fi

        case "$TYPE" in
          zset)
            DATA="$(redis_cmd ZREVRANGEBYSCORE "$key" "+inf" "-inf" WITHSCORES | paste - - | awk '{printf "{\"member\":\"%s\",\"score\":%s}", $1, $2}' | paste -sd ',')"
            printf "    \"%s\": [%s]" "$key" "$DATA"
            ;;
          hash)
            DATA="$(redis_cmd HGETALL "$key" | paste - - | awk '{printf "\"%s\":\"%s\"", $1, $2}' | paste -sd ',')"
            printf "    \"%s\": {%s}" "$key" "$DATA"
            ;;
          list)
            DATA="$(redis_cmd LRANGE "$key" 0 -1 | awk '{printf "\"%s\"", $0}' | paste -sd ',')"
            printf "    \"%s\": [%s]" "$key" "$DATA"
            ;;
          *)
            DATA="$(redis_cmd GET "$key")"
            printf "    \"%s\": \"%s\"" "$key" "$DATA"
            ;;
        esac
      done

      echo ""
      echo "  }"
      echo "}"
    } > "$DEST"

    echo "[완료] JSON 내보내기: $DEST"
    echo "[크기] $(du -h "$DEST" | cut -f1)"
    ;;
  keys)
    echo "=== BadBoss Redis 키 현황 ==="
    check_redis

    echo ""
    echo "--- 리더보드 키 ---"
    redis_cmd KEYS "leaderboard:*" 2>/dev/null

    echo ""
    echo "--- 에이전트 키 ---"
    redis_cmd KEYS "agent:*" 2>/dev/null

    echo ""
    echo "--- 리액션 키 ---"
    redis_cmd KEYS "reaction:*" 2>/dev/null | grep -v "reaction:ip:" || true

    echo ""
    echo "--- 보고 내역 키 ---"
    redis_cmd KEYS "reports:*" 2>/dev/null

    echo ""
    TOTAL="$(redis_cmd DBSIZE | awk '{print $NF}')"
    echo "[합계] 전체 키: $TOTAL"
    ;;
  *)
    echo "사용법: $0 [dump|restore|export|keys]"
    echo ""
    echo "  dump             - RDB 스냅샷 백업 (기본값)"
    echo "  restore <파일>   - RDB 파일로 복원"
    echo "  export           - JSON 형식으로 내보내기"
    echo "  keys             - 현재 키 현황 조회"
    echo ""
    echo "환경변수:"
    echo "  REDIS_HOST       - Redis 호스트 (기본: localhost)"
    echo "  REDIS_PORT       - Redis 포트 (기본: 6379)"
    echo "  REDIS_PASSWORD   - Redis 패스워드 (기본: 없음)"
    exit 1
    ;;
esac
