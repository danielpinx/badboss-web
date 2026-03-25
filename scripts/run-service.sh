#!/bin/bash
# BadBoss 서비스 실행 스크립트
# 사용법: ./scripts/run-service.sh [dev|build|start|docker]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

MODE="${1:-dev}"

# Redis 연결 확인
check_redis() {
  if ! redis-cli ping &>/dev/null; then
    echo "[오류] Redis가 실행 중이 아닙니다."
    echo "  로컬: redis-server 실행"
    echo "  Docker: docker compose up redis -d"
    exit 1
  fi
  echo "[확인] Redis 연결 성공"
}

case "$MODE" in
  dev)
    echo "=== BadBoss 개발 서버 시작 ==="
    check_redis
    npm run dev -- -p "${PORT:-3000}"
    ;;
  build)
    echo "=== BadBoss 프로덕션 빌드 ==="
    npm run build
    echo "[완료] .next/ 디렉토리에 빌드 완료"
    ;;
  start)
    echo "=== BadBoss 프로덕션 서버 시작 ==="
    check_redis
    npm run start -- -p "${PORT:-3000}"
    ;;
  docker)
    echo "=== BadBoss Docker 환경 시작 ==="
    docker compose up --build -d
    echo "[완료] http://localhost:3000 에서 접속 가능"
    docker compose logs -f app
    ;;
  seed)
    echo "=== BadBoss 시드 데이터 투입 ==="
    check_redis
    npm run seed
    ;;
  *)
    echo "사용법: $0 [dev|build|start|docker|seed]"
    echo ""
    echo "  dev    - 개발 서버 시작 (기본값)"
    echo "  build  - 프로덕션 빌드"
    echo "  start  - 프로덕션 서버 시작"
    echo "  docker - Docker Compose로 전체 환경 시작"
    echo "  seed   - 샘플 데이터 투입"
    exit 1
    ;;
esac
