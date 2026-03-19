
import { RankingStrategy } from "./ranking-strategy"
import type { SessionSearchResult, SessionFilters } from "../types"

export class TimeRankingStrategy extends RankingStrategy {
  rank(sessions: SessionSearchResult[], filters: SessionFilters): SessionSearchResult[] {
    return sessions
      .map((session) => ({
        ...session,
        relevanceScore: this.calculateScore(session, filters),
      }))
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
  }

  private calculateScore(session: SessionSearchResult, filters: SessionFilters): number {
    let score = 100


    const daysUntilSession = Math.floor((session.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    if (daysUntilSession <= 1) {
      score += 50
    } else if (daysUntilSession <= 3) {
      score += 30
    } else if (daysUntilSession <= 7) {
      score += 15
    } else {
      score -= daysUntilSession
    }


    const participantCount = session.participants?.filter((p) => p.status === "approved").length || 0
    const availableSpots = session.capacity - participantCount
    if (availableSpots > 0) {
      score += 10
    }

    return Math.max(0, score)
  }
}
