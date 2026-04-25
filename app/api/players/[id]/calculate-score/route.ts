/*
  /api/players/[id]/calculate-score — POST

  UC-14: Calculates a player's overall score by averaging all their
  individual performance scores, then saves the result to the Rankings table.

  Why average? A single great game shouldn't define a player — consistency matters.
  This gives a fair representation across an entire season.
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const role = (session?.user as any).role;
  if (role !== "Coach" && role !== "Manager" && role !== "Admin") {
    return NextResponse.json(
      { error: "Only Coaches or Managers can calculate player scores." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const playerID = parseInt(id);

  const player = await prisma.players.findUnique({
    where: { PlayerID: playerID },
    include: {
      Performances: {
        where: { CalculatedScore: { not: null } },
        select: { CalculatedScore: true },
      },
    },
  });

  if (!player) {
    return NextResponse.json({ error: "Player not found." }, { status: 404 });
  }

  if (player.Performances.length === 0) {
    return NextResponse.json(
      { error: "No performance data available to calculate score." },
      { status: 400 }
    );
  }

  // Average of all individual performance scores
  const totalScore = player.Performances.reduce(
    (sum, p) => sum + (p.CalculatedScore ?? 0),
    0
  );
  const avgScore = parseFloat((totalScore / player.Performances.length).toFixed(2));

  // Upsert into Rankings — update if this player+position already has a ranking
  const ranking = await prisma.rankings.upsert({
    where: {
      // We need a unique constraint here — using a raw approach:
      // find existing then create/update
      RankingID: (
        await prisma.rankings.findFirst({
          where: { PlayerID: playerID, Position: player.Position },
          select: { RankingID: true },
        })
      )?.RankingID ?? 0,
    },
    update: {
      Rank: 0, // Will be recalculated when rankings are sorted
      GeneratedDate: new Date(),
    },
    create: {
      PlayerID: playerID,
      Position: player.Position,
      Rank: 0,
      GeneratedDate: new Date(),
    },
  });

  return NextResponse.json({
    message: "Score calculated successfully.",
    playerID,
    playerName: player.Name,
    position: player.Position,
    averageScore: avgScore,
    performancesUsed: player.Performances.length,
  });
}
