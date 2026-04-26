/**
 * Represents a player search result.
 */
export interface SearchResult {
  PlayerID: number;
  Name: string;
  Position: string;
  Club: string | null;
}

/**
 * Represents a player with performance metrics for comparison.
 */
export interface ComparedPlayer {
  PlayerID: number;
  Name: string;
  Position: string;
  Club: string | null;
  Age: number | null;
  Height: number | null;
  Weight: number | null;
  ScoutName: string | null;
  MatchesPlayed: number;
  TotalGoals: number;
  TotalAssists: number;
  TotalPasses: number;
  AvgRating: number | null;
  AverageScore: number | null;
  GoalsPerMatch: number | null;
  AssistsPerMatch: number | null;
  PassesPerMatch: number | null;
}

/**
 * Represents a ranked player entity.
 */
export interface RankedPlayer {
  Rank: number;
  PlayerID: number;
  Name: string;
  Position: string;
  Club: string | null;
  Age: number | null;
  MatchesPlayed: number;
  AverageScore: number;
}
