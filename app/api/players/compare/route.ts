/*
  /api/players/compare — GET

  UC-18: Compare up to 3 players side-by-side.

  Query param:
  - ids: comma-separated PlayerIDs e.g. ?ids=1,2,3

  Returns for each player:
  - Profile (name, age, position, club, height, weight)
  - Aggregate performance stats (total goals, assists, passes, avg rating)
  - Average calculated score
  - Match count
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids") || "";

  const ids = idsParam
    .split(",")
    .map((id) => parseInt(id.trim()))
    .filter((id) => !isNaN(id));

  // UC-18 Alternate: need at least 2 players to compare
  if (ids.length < 2) {
    return NextResponse.json(
      { error: "Select at least 2 players to compare." },
      { status: 400 }
    );
  }

  if (ids.length > 3) {
    return NextResponse.json(
      { error: "You can compare a maximum of 3 players at once." },
      { status: 400 }
    );
  }

  try {
    const players = await prisma.players.findMany({
      where: { PlayerID: { in: ids } },
      include: {
        Performances: {
          select: {
            Goals: true,
            Assists: true,
            Passes: true,
            Rating: true,
            CalculatedScore: true,
          },
        },
        Users: { select: { Name: true } },
      },
    });

    if (players.length === 0) {
      return NextResponse.json({ error: "No players found." }, { status: 404 });
    }

    // Build enriched comparison payload
    const compared = players.map((p) => {
      const matches = p.Performances.length;
      const totalGoals   = p.Performances.reduce((s, perf) => s + (perf.Goals ?? 0), 0);
      const totalAssists = p.Performances.reduce((s, perf) => s + (perf.Assists ?? 0), 0);
      const totalPasses  = p.Performances.reduce((s, perf) => s + (perf.Passes ?? 0), 0);
      const avgRating = matches
        ? parseFloat(
            (p.Performances.reduce((s, perf) => s + (perf.Rating ?? 0), 0) / matches).toFixed(1)
          )
        : null;
      const avgScore = matches
        ? parseFloat(
            (
              p.Performances.filter((perf) => perf.CalculatedScore != null).reduce(
                (s, perf) => s + (perf.CalculatedScore ?? 0),
                0
              ) / p.Performances.filter((perf) => perf.CalculatedScore != null).length || matches
            ).toFixed(1)
          )
        : null;

      return {
        PlayerID: p.PlayerID,
        Name: p.Name,
        Position: p.Position,
        Club: p.Club,
        Age: p.Age,
        Height: p.Height,
        Weight: p.Weight,
        ScoutName: p.Users?.Name ?? null,
        // Performance aggregates
        MatchesPlayed: matches,
        TotalGoals: totalGoals,
        TotalAssists: totalAssists,
        TotalPasses: totalPasses,
        AvgRating: avgRating,
        AverageScore: avgScore,
        // Per-match averages (for fair comparison)
        GoalsPerMatch:   matches ? parseFloat((totalGoals / matches).toFixed(1))   : null,
        AssistsPerMatch: matches ? parseFloat((totalAssists / matches).toFixed(1)) : null,
        PassesPerMatch:  matches ? parseFloat((totalPasses / matches).toFixed(1))  : null,
      };
    });

    // Return in the same order as requested IDs
    const ordered = ids
      .map((id) => compared.find((p) => p.PlayerID === id))
      .filter(Boolean);

    return NextResponse.json(ordered);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to compare players." }, { status: 500 });
  }
}
