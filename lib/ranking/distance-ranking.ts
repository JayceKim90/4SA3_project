// Distance-based ranking strategy
import { RankingStrategy } from "./ranking-strategy"
import type { SessionSearchResult, SessionFilters } from "../types"

export class DistanceRankingStrategy extends RankingStrategy {
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

    // Distance is most important
    if (session.distance !== undefined) {
      // Closer sessions get higher scores
      score -= session.distance * 5
    }

    // Recent sessions get a small boost
    const daysUntilSession = Math.floor((session.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysUntilSession <= 7) {
      score += 10
    }

    // Sessions with available capacity get a boost
    const participantCount = session.participants?.filter((p) => p.status === "approved").length || 0
    const availableSpots = session.capacity - participantCount
    if (availableSpots > 0) {
      score += availableSpots * 2
    }

    return Math.max(0, score)
  }
}
