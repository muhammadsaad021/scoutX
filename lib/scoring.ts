/*
  SCORING FORMULA — lib/scoring.ts

  This calculates a player's performance score from a single match's stats.
  Used in Phase 5 (saving performance) and referenced in Phase 6 (rankings).

  Formula breakdown (weighted out of 100):
  - Goals     × 10   → big contributor (attack)
  - Assists   × 6    → supporting (attack)
  - Passes    × 0.1  → volume stat (technical)
  - Rating    × 3    → overall match rating (out of 10)

  Result is clamped to a max of 100.
*/

export function calculatePerformanceScore(
  goals: number,
  assists: number,
  passes: number,
  rating: number
): number {
  const score = goals * 10 + assists * 6 + passes * 0.1 + rating * 3;
  return Math.min(parseFloat(score.toFixed(2)), 100);
}
