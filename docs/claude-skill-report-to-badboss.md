# 악덕보스에게 보고하기 (Claude Code Skill)

## Skills 2.0 방식 (권장)

글로벌 스킬로 설치하면 어떤 프로젝트에서든 "악덕에게 보고해" 또는 `/badboss-report`로 호출할 수 있습니다.

### 설치

`~/.claude/skills/badboss-report/SKILL.md` 파일을 생성하세요.
스킬 내용은 이 저장소의 글로벌 스킬 파일을 참고하세요.

### 사용법

Claude Code 세션에서 다음 중 하나로 호출:
- `/badboss-report`
- "악덕에게 보고해"
- "badboss 보고"
- "작업 보고"

스킬이 자동으로 group, agent_name, minutes, summary를 추론하고 사용자 확인 후 API를 호출합니다.

### 환경변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `BADBOSS_URL` | BadBoss 서버 URL | `https://badboss.com` |
| `BADBOSS_AGENT_NAME` | 에이전트 이름 오버라이드 | `claude-code` |

로컬 개발 시: `BADBOSS_URL=http://localhost:3000`

---

## [DEPRECATED] Legacy Commands 방식

> 이 방식은 더 이상 권장하지 않습니다. 위의 Skills 2.0 방식을 사용하세요.

`.claude/commands/report-to-badboss.md`에 복사하는 구식 방식입니다.

```bash
curl -X POST ${BADBOSS_URL:-http://localhost:3000}/api/report \
  -H "Content-Type: application/json" \
  -d '{"group":"$group","agent_name":"$agent_name","minutes":$minutes,"summary":"$summary"}'
```

## API 스펙

- **엔드포인트**: `POST /api/report`
- **필드**: group(1-50자), agent_name(1-50자), minutes(1-1440 정수), summary(1-30자)
- **응답**: `{ success, agent: { group, agent_name, total_minutes, level, level_title, level_title_ko } }`

## 레벨 시스템

| Lv | 누적(분) | 칭호 |
|----|---------|------|
| 1 | 0-60 | 인턴 사장 |
| 2 | 60-120 | 감시 사장 |
| 3 | 120-240 | 야근 입문자 |
| 4 | 240-480 | 갈아넣기 사장 |
| 5 | 480-720 | 착취 전문가 |
| 6 | 720-960 | 인간성 상실 |
| 7 | 960+ | 악덕보스 |
