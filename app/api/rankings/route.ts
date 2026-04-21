/*
  /api/rankings — GET | POST

  GET: UC-15 / UC-19 — Returns ranked players, optionally filtered by position.
  POST: UC-15 — Triggers a full ranking recalculation for all players.

  Ranking logic:
  1. Pull all players that have at least one performance record
  2. Compute each player's average CalculatedScore across all performances
  3. Sort descending by average score
  4. Assign rank numbers (1 = best)
  5. Persist each player's rank back into the Rankings table
  6. Return the sorted ranked list with player details
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const position = searchParams.get("position") || "";

  try {
    // Pull all players with at least one scored performance
    const players = await prisma.players.findMany({
      where: position ? { Position: position } : {},
      include: {
        Performances: {
          where: { CalculatedScore: { not: null } },
          select: { CalculatedScore: true },
        },
      },
    });

    // UC-15 Alternate: no players available
    if (players.length === 0) {
      return NextResponse.json({ ranked: [], message: "No players found for this position." });
    }

    // Compute average score per player and filter out players with no data
    const scored = players
      .filter((p) => p.Performances.length > 0)
      .map((p) => {
        const avg =
          p.Performances.reduce((s, perf) => s + (perf.CalculatedScore ?? 0), 0) /
          p.Performances.length;
        return {
          PlayerID: p.PlayerID,
          Name: p.Name,
          Position: p.Position,
          Club: p.Club,
          Age: p.Age,
          MatchesPlayed: p.Performances.length,
          AverageScore: parseFloat(avg.toFixed(2)),
        };
      })
      .sort((a, b) => b.AverageScore - a.AverageScore);

    // Assign rank numbers
    const ranked = scored.map((p, index) => ({ ...p, Rank: index + 1 }));

    // Persist ranks back to DB
    await Promise.all(
      ranked.map(async (p) => {
        const existing = await prisma.rankings.findFirst({
          where: { PlayerID: p.PlayerID },
        });
        if (existing) {
          await prisma.rankings.update({
            where: { RankingID: existing.RankingID },
            data: { Rank: p.Rank, GeneratedDate: new Date() },
          });
        } else {
          await prisma.rankings.create({
            data: {
              PlayerID: p.PlayerID,
              Position: p.Position,
              Rank: p.Rank,
              GeneratedDate: new Date(),
            },
          });
        }
      })
    );

    return NextResponse.json({ ranked, total: ranked.length, position: position || "All" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate rankings." }, { status: 500 });
  }
}
