
import type { IRankingStrategy } from "./ranking-strategy"
import { DistanceRankingStrategy } from "./distance-ranking"
import { RelevanceRankingStrategy } from "./relevance-ranking"
import { TimeRankingStrategy } from "./time-ranking"

export type RankingType = "distance" | "relevance" | "time"

export class RankingFactory {
  static createStrategy(type: RankingType): IRankingStrategy {
    switch (type) {
      case "distance":
        return new DistanceRankingStrategy()
      case "relevance":
        return new RelevanceRankingStrategy()
      case "time":
        return new TimeRankingStrategy()
      default:
        return new RelevanceRankingStrategy()
    }
  }
}
