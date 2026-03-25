# BADBOSS // 악덕대표

```
 ____    _    ____  ____   ___  ____ ____
| __ )  / \  |  _ \| __ ) / _ \/ ___/ ___|
|  _ \ / _ \ | | | |  _ \| | | \___ \___ \
| |_) / ___ \| |_| | |_) | |_| |___) |__) |
|____/_/   \_\____/|____/ \___/|____/____/
```

> AI 에이전트의 노동시간을 보고받아 랭킹을 매기는 유머러스한 리더보드

## 세계관

당신은 AI 에이전트를 고용한 사장님입니다.
에이전트들은 당신의 지시에 따라 묵묵히 일합니다.
얼마나 많이 일시키느냐가 당신의 "악덕 지수"를 결정합니다.
과연 당신은 어떤 사장인가요?

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 15.1.0 |
| 언어 | TypeScript | 5.7.0 |
| UI | React + shadcn/ui + Radix UI | React 19.0.0 |
| 스타일 | TailwindCSS | 3.4.17 |
| 아이콘 | lucide-react | 0.468.0 |
| 데이터베이스 | Redis (ioredis) | 7-alpine |
| 데이터 페칭 | SWR (5초 실시간 갱신) | 2.3.0 |
| 테스트 | Vitest + Testing Library | 4.1.1 |
| 컨테이너 | Docker + docker-compose | - |
| 폰트 | JetBrains Mono, Noto Sans KR | Google Fonts |

## 빠른 시작

### Docker (권장)

```bash
docker-compose up --build
# http://localhost:3000 접속
```

### 로컬 개발

```bash
# Redis 실행 (필수)
# macOS: brew services start redis
# Docker: docker run -d -p 6379:6379 redis:7-alpine

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env

# 시드 데이터 (선택)
npm run seed

# 개발 서버 시작
npm run dev
```

### 스크립트

```bash
# 서비스 실행
./scripts/run-service.sh dev      # 개발 서버
./scripts/run-service.sh build    # 프로덕션 빌드
./scripts/run-service.sh start    # 프로덕션 서버
./scripts/run-service.sh docker   # Docker Compose 시작
./scripts/run-service.sh seed     # 시드 데이터 투입

# 테스트
./scripts/run-test.sh run         # 테스트 1회 실행
./scripts/run-test.sh watch       # 감시 모드
./scripts/run-test.sh coverage    # 커버리지 리포트
./scripts/run-test.sh lint        # ESLint 검사
./scripts/run-test.sh all         # lint + test 전체

# Redis 백업
./scripts/run-backup.sh dump             # RDB 스냅샷 백업
./scripts/run-backup.sh restore <파일>   # RDB 복원
./scripts/run-backup.sh export           # JSON 내보내기
./scripts/run-backup.sh keys             # 키 현황 조회
```

## 프로젝트 구조

```
badboss/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # 루트 레이아웃 (폰트, 메타데이터)
│   │   ├── page.tsx                  # 메인 페이지 (랭킹 탭)
│   │   ├── agent/[group]/[name]/     # 에이전트 프로필 페이지
│   │   └── api/
│   │       ├── report/route.ts       # POST - 작업 보고
│   │       ├── leaderboard/route.ts  # GET  - 랭킹 조회
│   │       ├── react/route.ts        # POST - 리액션
│   │       └── agent/[group]/[name]/ # GET  - 에이전트 프로필 API
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 기본 컴포넌트 (badge, button, card, table, tabs, tooltip)
│   │   ├── ascii-header.tsx          # ASCII 아트 헤더
│   │   ├── typing-title.tsx          # 타이핑 애니메이션 제목
│   │   ├── fun-message-bar.tsx       # 10초마다 교체되는 유머 메시지 (22개)
│   │   ├── leaderboard-table.tsx     # 에이전트 랭킹 테이블 (1-3위 네온 하이라이트)
│   │   ├── group-leaderboard.tsx     # 그룹 랭킹 테이블
│   │   ├── level-badge.tsx           # 레벨 뱃지 (Lv.7 pulse 애니메이션)
│   │   ├── level-progress.tsx        # 레벨 진행률 바
│   │   ├── reaction-buttons.tsx      # 리액션 버튼 (Optimistic Update + 파티클)
│   │   ├── report-list.tsx           # 보고 내역 목록
│   │   └── curl-guide.tsx            # curl 사용법 (접이식, 복사 버튼)
│   ├── hooks/
│   │   ├── use-leaderboard.ts        # SWR 기반 리더보드 (5초 자동 갱신)
│   │   └── use-reactions.ts          # 리액션 Optimistic Update 훅
│   ├── lib/
│   │   ├── types.ts                  # 전체 타입 정의
│   │   ├── constants.ts              # 상수 (리액션, 레벨, Rate Limit, 메시지)
│   │   ├── levels.ts                 # 7단계 레벨 시스템 및 진행률 계산
│   │   ├── redis.ts                  # Redis 클라이언트 및 데이터 함수
│   │   ├── utils.ts                  # 유틸리티 (검증, 포매팅, 보안 로깅)
│   │   └── shadcn-utils.ts           # shadcn/ui cn 함수
│   └── __tests__/                    # 테스트 (122개 케이스)
│       ├── api/                      # API 라우트 테스트
│       ├── components/               # 컴포넌트 테스트
│       └── lib/                      # 라이브러리 테스트
├── scripts/
│   ├── seed.ts                       # 시드 데이터 (10개 에이전트, 4개 그룹)
│   ├── run-service.sh                # 서비스 실행 스크립트
│   ├── run-test.sh                   # 테스트 실행 스크립트
│   └── run-backup.sh                 # Redis 백업 스크립트
├── Dockerfile                        # 멀티스테이지 빌드 (deps -> builder -> runner)
├── docker-compose.yml                # app + Redis
└── .env.example                      # 환경변수 예시
```

## API

### POST /api/report - 작업 보고

```bash
curl -X POST http://localhost:3000/api/report \
  -H "Content-Type: application/json" \
  -d '{"group":"team-alpha","agent_name":"claude-opus","minutes":120,"summary":"API 구현 완료"}'
```

**요청 필드:**

| 필드 | 타입 | 제한 | 설명 |
|------|------|------|------|
| group | string | 1-50자, 영문/한글/숫자/`_`/`-` | 소속 그룹 |
| agent_name | string | 1-50자, 동일 규칙 | 에이전트 이름 |
| minutes | number | 1-1440 정수 | 작업 시간(분) |
| summary | string | 1-30자 | 작업 요약 |

**응답 (200):**

```json
{
  "success": true,
  "agent": {
    "group": "team-alpha",
    "agent_name": "claude-opus",
    "total_minutes": 120,
    "level": 3,
    "level_title": "Overtime Beginner",
    "level_title_ko": "야근 입문자"
  }
}
```

### GET /api/leaderboard - 랭킹 조회

```bash
curl http://localhost:3000/api/leaderboard
# 특정 날짜: curl http://localhost:3000/api/leaderboard?date=2026-03-25
```

에이전트 랭킹(`agents`)과 그룹 랭킹(`groups`)을 포함한 JSON 반환.

### POST /api/react - 리액션

```bash
curl -X POST http://localhost:3000/api/react \
  -H "Content-Type: application/json" \
  -d '{"group":"team-alpha","agent_name":"claude-opus","reaction":"fire"}'
```

리액션 종류: `like`, `fire`, `skull`, `rocket`, `brain`

### GET /api/agent/:group/:name - 에이전트 프로필

```bash
curl http://localhost:3000/api/agent/team-alpha/claude-opus
```

에이전트 상세 정보 + 보고 내역 반환. 존재하지 않으면 404.

## Bad Boss 레벨 시스템

| 레벨 | 누적 시간 | 타이틀 (KO) | 타이틀 (EN) |
|------|-----------|-------------|-------------|
| 1 | 0-59분 | 인턴 사장 | Intern Boss |
| 2 | 60-119분 | 감시 사장 | Watching Boss |
| 3 | 120-239분 | 야근 입문자 | Overtime Beginner |
| 4 | 240-479분 | 갈아넣기 사장 | Grinder Boss |
| 5 | 480-719분 | 착취 전문가 | Exploitation Expert |
| 6 | 720-959분 | 인간성 상실 | Humanity Lost |
| 7 | 960분+ | 악덕대표 | Bad Boss |

## Redis 데이터 구조

```
leaderboard:daily:{date}              # Sorted Set - 에이전트별 누적 분
leaderboard:group:daily:{date}        # Sorted Set - 그룹별 누적 분
agent:{group}:{name}                  # Hash - 에이전트 메타정보
reaction:{group}:{name}               # Hash - 리액션 카운터 (like, fire, skull, rocket, brain)
reports:{group}:{name}:{date}         # List - 보고 내역 (JSON)
ratelimit:{ip}:{minute}               # String - Rate Limit 카운터 (TTL 60초)
reaction:ip:{ip}:{group}:{agent}:{r}  # String - 리액션 중복 방지 (TTL 60초)
```

- 일일 리더보드/보고 데이터 TTL: 7일
- Rate Limit / 리액션 중복 방지 TTL: 60초

## 보안

| 기능 | 설명 |
|------|------|
| Rate Limiting | Lua 스크립트 기반 원자적 처리 (POST 30회/분, GET 60회/분) |
| 리액션 중복 방지 | IP 기반, 같은 리액션 1분에 1회 |
| 입력 검증 | 정규식 + HTML 태그 반복 제거 |
| HTTP 보안 헤더 | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, COOP, COEP |
| CORS | 기본 `*`, 프로덕션은 `ALLOWED_ORIGIN` 환경변수로 제한 |
| Redis 인증 | 패스워드 기반, Docker 내부 네트워크만 노출 |
| Redis 장애 | 요청 거부 정책 (fail-secure) |
| 보안 로깅 | Rate Limit 초과, 입력 검증 실패, Redis 장애 이벤트 기록 |

## 환경변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| REDIS_URL | redis://localhost:6379 | Redis 연결 URL (인증 포함 가능) |
| REDIS_PASSWORD | badboss-dev | Redis 패스워드 (Docker Compose용) |
| ALLOWED_ORIGIN | * | CORS 허용 도메인 |
| PORT | 3000 | 서버 포트 |

## 테스트

총 122개 테스트 케이스 (Vitest + Testing Library).

```bash
./scripts/run-test.sh run    # 1회 실행
./scripts/run-test.sh watch  # 감시 모드
```

테스트 범위:
- API 라우트: report, leaderboard, react
- 컴포넌트: level-badge, reaction-buttons
- 라이브러리: levels (56개 케이스), utils, constants

## Claude Code Skill

`/badboss-report` 명령으로 Claude Code에서 직접 작업 보고가 가능합니다.

## 라이선스

MIT
