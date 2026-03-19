// Strategy Pattern - Pluggable ranking methods for search results
import type { SessionSearchResult, SessionFilters } from "../types"

export interface IRankingStrategy {
  rank(sessions: SessionSearchResult[], filters: SessionFilters): SessionSearchResult[]
}

export abstract class RankingStrategy implements IRankingStrategy {
  abstract rank(sessions: SessionSearchResult[], filters: SessionFilters): SessionSearchResult[]
}
