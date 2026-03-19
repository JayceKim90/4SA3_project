import { getGroupRepository } from "@/lib/repository/group-repository";
import type { GroupFilters, GroupSearchResult } from "@/lib/types";
import {
  RankingFactory,
  type RankingType,
} from "@/lib/ranking/ranking-factory";

/**
 * Mediator: 검색 요청 한 번으로 Repository + 랭킹 + 참가 상태를 묶어
 * Discover의 목록·지도가 같은 결과를 쓰도록 한다.
 */
export async function executeGroupSearch(
  filters: GroupFilters,
  rankingType: RankingType,
  userId?: string | null
): Promise<GroupSearchResult[]> {
  const repo = getGroupRepository();
  let results = await repo.findByFilters(filters);
  const rankingStrategy = RankingFactory.createStrategy(rankingType);
  results = rankingStrategy.rank(results, filters);

  if (userId) {
    results = results.map((group) => {
      const participant = group.participants?.find((p) => p.userId === userId);
      return {
        ...group,
        participationStatus: participant ? participant.status : null,
      };
    });
  }

  return results;
}
