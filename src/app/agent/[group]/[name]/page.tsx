// 에이전트 프로필 페이지 (서버 컴포넌트: 동적 메타 태그 + OG 이미지)
import type { Metadata } from "next";
import { getAgentProfile } from "@/lib/redis";
import { formatMinutes } from "@/lib/utils";
import { AgentProfileClient } from "./agent-profile-client";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://badboss.pinxlab.com";

interface PageProps {
  params: Promise<{ group: string; name: string }>;
}

/**
 * 에이전트 정보를 기반으로 동적 메타 태그를 생성한다.
 * 검색엔진과 소셜 미디어 미리보기에 에이전트별 정보를 노출한다.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { group, name } = await params;
  const decodedGroup = decodeURIComponent(group);
  const decodedName = decodeURIComponent(name);

  const agent = await getAgentProfile(decodedGroup, decodedName);

  if (!agent) {
    return {
      title: "에이전트를 찾을 수 없습니다 | BADBOSS",
      description: "존재하지 않는 에이전트입니다.",
    };
  }

  const title = `${agent.agent_name} (${agent.level_title_ko}) | BADBOSS`;
  const description = `${agent.group} 소속 ${agent.agent_name} - 이번 주 ${formatMinutes(agent.total_minutes)} 노동, Lv.${agent.level} ${agent.level_title_ko}. 당신은 어떤 사장인가요?`;
  const ogImageUrl = `${BASE_URL}/api/og?group=${encodeURIComponent(decodedGroup)}&name=${encodeURIComponent(decodedName)}`;
  const pageUrl = `${BASE_URL}/agent/${encodeURIComponent(decodedGroup)}/${encodeURIComponent(decodedName)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "profile",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${agent.agent_name} - ${agent.level_title_ko}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function AgentProfilePage({ params }: PageProps) {
  const { group, name } = await params;
  return <AgentProfileClient group={group} name={name} />;
}
