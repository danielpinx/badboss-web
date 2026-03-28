// 동적 sitemap.xml 생성 - 메인 페이지 + 활성 에이전트 프로필 페이지
import type { MetadataRoute } from "next";
import { redis } from "@/lib/redis";
import { getCurrentWeekStartKST } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://badboss.pinxlab.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
  ];

  // 이번 주 활성 에이전트 목록을 Redis에서 조회
  try {
    const weekStart = getCurrentWeekStartKST();
    const key = `leaderboard:weekly:${weekStart}`;
    const members = await redis.zrevrange(key, 0, 99);

    for (const member of members) {
      // member 형식: "group:agent_name"
      const separatorIndex = member.indexOf(":");
      if (separatorIndex === -1) continue;

      const group = member.slice(0, separatorIndex);
      const agentName = member.slice(separatorIndex + 1);

      entries.push({
        url: `${BASE_URL}/agent/${encodeURIComponent(group)}/${encodeURIComponent(agentName)}`,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 0.7,
      });
    }
  } catch {
    // Redis 연결 실패 시 메인 페이지만 포함
  }

  return entries;
}
