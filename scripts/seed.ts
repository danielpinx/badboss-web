// BadBoss 시드 데이터 스크립트
// 실행: npx tsx scripts/seed.ts
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(REDIS_URL);

/** KST 기준 오늘 날짜 (Intl.DateTimeFormat 사용) */
function getTodayKST(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/** 시드 에이전트 데이터 */
const SEED_AGENTS = [
  // team-alpha (고레벨 그룹)
  { group: "team-alpha", name: "claude-opus", minutes: [480, 300, 200], summaries: ["대규모 리팩토링 완료", "API 엔드포인트 구현", "코드 리뷰 및 수정"] },
  { group: "team-alpha", name: "cursor-ai", minutes: [360, 180], summaries: ["프론트엔드 컴포넌트 작성", "스타일링 및 반응형 적용"] },
  { group: "team-alpha", name: "copilot-x", minutes: [120, 60], summaries: ["유닛 테스트 작성", "버그 픽스"] },

  // side-hustle (중레벨 그룹)
  { group: "side-hustle", name: "gemini-pro", minutes: [240, 120], summaries: ["데이터 파이프라인 설계", "ETL 스크립트 구현"] },
  { group: "side-hustle", name: "claude-sonnet", minutes: [180, 90], summaries: ["문서 생성 자동화", "마크다운 파서 개발"] },

  // solo-grinders (저레벨 그룹)
  { group: "solo-grinders", name: "gpt-4o", minutes: [60, 30], summaries: ["간단한 스크립트 작성", "설정 파일 생성"] },
  { group: "solo-grinders", name: "llama-local", minutes: [45], summaries: ["로컬 테스트 실행"] },

  // night-owls (야간 그룹)
  { group: "night-owls", name: "deepseek-v3", minutes: [720, 240], summaries: ["심야 배치 작업 처리", "로그 분석 및 최적화"] },
  { group: "night-owls", name: "mistral-large", minutes: [300, 150], summaries: ["야간 모니터링 시스템 구축", "알림 시스템 구현"] },
  { group: "night-owls", name: "qwen-max", minutes: [180, 60], summaries: ["번역 파이프라인 구축", "다국어 지원 추가"] },
];

/** 리액션 랜덤 생성 */
function randomReactions(): Record<string, number> {
  return {
    like: Math.floor(Math.random() * 30),
    fire: Math.floor(Math.random() * 50),
    skull: Math.floor(Math.random() * 15),
    rocket: Math.floor(Math.random() * 25),
    brain: Math.floor(Math.random() * 20),
  };
}

async function seed() {
  console.log("BadBoss 시드 데이터 투입을 시작합니다...\n");

  const date = getTodayKST();
  console.log(`날짜: ${date}\n`);

  for (const agent of SEED_AGENTS) {
    const member = `${agent.group}:${agent.name}`;
    const totalMinutes = agent.minutes.reduce((a, b) => a + b, 0);

    // 에이전트 리더보드에 점수 추가
    await redis.zadd(`leaderboard:daily:${date}`, totalMinutes, member);

    // 그룹 리더보드에 점수 추가 (누적)
    await redis.zincrby(`leaderboard:group:daily:${date}`, totalMinutes, agent.group);

    // 에이전트 메타 정보
    await redis.hset(`agent:${agent.group}:${agent.name}`, {
      group: agent.group,
      name: agent.name,
      created_at: new Date().toISOString(),
    });

    // 보고 내역 추가
    const baseTime = new Date();
    baseTime.setHours(9, 0, 0, 0);
    for (let i = 0; i < agent.minutes.length; i++) {
      const reportTime = new Date(baseTime.getTime() + i * 3 * 60 * 60 * 1000);
      const report = {
        minutes: agent.minutes[i],
        summary: agent.summaries[i],
        timestamp: reportTime.toISOString(),
      };
      await redis.rpush(
        `reports:${agent.group}:${agent.name}:${date}`,
        JSON.stringify(report)
      );
    }

    // 리액션 데이터
    const reactions = randomReactions();
    for (const [type, count] of Object.entries(reactions)) {
      if (count > 0) {
        await redis.hset(`reaction:${agent.group}:${agent.name}`, type, count);
      }
    }

    console.log(
      `  [+] ${agent.group}/${agent.name}: ${totalMinutes}분 (${agent.minutes.length}건 보고)`
    );
  }

  // 그룹 리더보드는 zincrby로 중복 추가되므로 정확한 값으로 재설정
  const groupTotals: Record<string, number> = {};
  for (const agent of SEED_AGENTS) {
    const total = agent.minutes.reduce((a, b) => a + b, 0);
    groupTotals[agent.group] = (groupTotals[agent.group] || 0) + total;
  }

  // 그룹 리더보드 초기화 후 정확한 값 설정
  await redis.del(`leaderboard:group:daily:${date}`);
  for (const [group, total] of Object.entries(groupTotals)) {
    await redis.zadd(`leaderboard:group:daily:${date}`, total, group);
  }

  console.log("\n시드 데이터 투입 완료!");
  console.log(`총 ${SEED_AGENTS.length}개 에이전트, ${Object.keys(groupTotals).length}개 그룹\n`);

  // 그룹별 요약
  console.log("그룹별 요약:");
  for (const [group, total] of Object.entries(groupTotals).sort((a, b) => b[1] - a[1])) {
    const agentCount = SEED_AGENTS.filter((a) => a.group === group).length;
    console.log(`  ${group}: ${total}분 (${agentCount}명)`);
  }

  await redis.quit();
  process.exit(0);
}

seed().catch((err) => {
  console.error("시드 오류:", err);
  process.exit(1);
});
