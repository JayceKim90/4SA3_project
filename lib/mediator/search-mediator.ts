import { getHobbyRepository } from "@/lib/repository/group-repository";
import type { HobbyFilters, HobbySearchResult } from "@/lib/types";
import {
  RankingFactory,
  type RankingType,
} from "@/lib/ranking/ranking-factory";

/**
 * Mediator: 검색 요청 한 번으로 Repository + 랭킹 + 참가 상태를 묶어
 * Discover의 목록·지도가 같은 결과를 쓰도록 한다.
 */
export async function executeHobbySearch(
  filters: HobbyFilters,
  rankingType: RankingType,
  userId?: string | null
): Promise<HobbySearchResult[]> {
  const repo = getHobbyRepository();
  let results = await repo.findByFilters(filters);
  const rankingStrategy = RankingFactory.createStrategy(rankingType);
  results = rankingStrategy.rank(results, filters);

  if (userId) {
    const uid = String(userId);
    results = results.map((hobby) => {
      const participant = hobby.participants?.find(
        (p) => String(p.userId) === uid
      );
      return {
        ...hobby,
        participationStatus: participant ? participant.status : null,
      };
    });
  }

  return results;
}

/** @deprecated Use executeHobbySearch */
export const executeGroupSearch = executeHobbySearch;
