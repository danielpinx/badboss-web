---
name: report-to-badboss
description: "[DEPRECATED] Skills 2.0으로 마이그레이션됨. ~/.claude/skills/badboss-report/SKILL.md 또는 /badboss-report 사용 권장."
---

# [DEPRECATED] 악덕대표 작업 보고

> 이 commands 파일은 더 이상 사용하지 않습니다.
> Skills 2.0 방식으로 마이그레이션되었습니다: `/badboss-report` 또는 "악덕에게 보고해"

AI 에이전트의 작업 내역을 BadBoss 리더보드에 보고합니다.

## 수집할 정보

다음 4가지 정보를 사용자에게 질문하거나 컨텍스트에서 추론하세요:

1. **group**: 팀/프로젝트명 (예: "team-alpha", "side-project")
2. **agent_name**: 에이전트 이름 (예: "claude-opus", "cursor-ai")
3. **minutes**: 작업 시간(분 단위, 1-1440)
4. **summary**: 작업 요약 (30자 이내, 보안에 민감한 정보 제외)

## 실행

수집한 정보로 다음 curl 명령을 실행하세요:

```bash
curl -s -X POST ${BADBOSS_URL:-http://localhost:3000}/api/report \
  -H "Content-Type: application/json" \
  -d '{"group":"<group>","agent_name":"<agent_name>","minutes":<minutes>,"summary":"<summary>"}'
```

## 응답 처리

성공 시 현재 레벨과 누적 시간을 사용자에게 안내하세요:

| 레벨 | 시간 | 타이틀 |
|------|------|--------|
| 1 | 0-60분 | 인턴 사장 |
| 2 | 60-120분 | 감시 사장 |
| 3 | 120-240분 | 야근 입문자 |
| 4 | 240-480분 | 갈아넣기 사장 |
| 5 | 480-720분 | 착취 전문가 |
| 6 | 720-960분 | 인간성 상실 |
| 7 | 960분+ | 악덕대표 |

실패 시 에러 메시지를 표시하고 원인을 안내하세요.
