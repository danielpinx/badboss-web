#!/bin/bash
# BadBoss 테스트 실행 스크립트
# 사용법: ./scripts/run-test.sh [run|watch|coverage|lint]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

MODE="${1:-run}"

case "$MODE" in
  run)
    echo "=== BadBoss 테스트 실행 (1회) ==="
    npx vitest run
    ;;
  watch)
    echo "=== BadBoss 테스트 감시 모드 ==="
    npx vitest
    ;;
  coverage)
    echo "=== BadBoss 테스트 커버리지 ==="
    npx vitest run --coverage
    ;;
  lint)
    echo "=== BadBoss ESLint 검사 ==="
    npm run lint
    ;;
  all)
    echo "=== BadBoss 전체 검증 (lint + test) ==="
    echo "--- ESLint ---"
    npm run lint
    echo ""
    echo "--- Vitest ---"
    npx vitest run
    echo ""
    echo "[완료] 전체 검증 통과"
    ;;
  *)
    echo "사용법: $0 [run|watch|coverage|lint|all]"
    echo ""
    echo "  run      - 테스트 1회 실행 (기본값)"
    echo "  watch    - 테스트 감시 모드"
    echo "  coverage - 테스트 커버리지 리포트"
    echo "  lint     - ESLint 검사"
    echo "  all      - lint + test 전체 실행"
    exit 1
    ;;
esac
