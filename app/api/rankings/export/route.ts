/*
  /api/rankings/export — GET

  UC-19 supporting: Export current rankings as a downloadable CSV file.
  Phase 10 will add PDF export — this handles CSV for now.

  Query params:
  - position: filter by position (optional)
  - format: "csv" (default, "pdf" coming in Phase 10)
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const position = searchParams.get("position") || "";

  // Re-run the same ranking logic
  const players = await prisma.players.findMany({
    where: position ? { Position: position } : {},
    include: {
      Performances: {
        where: { CalculatedScore: { not: null } },
        select: { CalculatedScore: true },
      },
    },
  });

  const scored = players
    .filter((p) => p.Performances.length > 0)
    .map((p) => {
      const avg =
        p.Performances.reduce((s, perf) => s + (perf.CalculatedScore ?? 0), 0) /
        p.Performances.length;
      return {
        Rank: 0,
        Name: p.Name,
        Position: p.Position,
        Club: p.Club ?? "N/A",
        Age: p.Age ?? "N/A",
        MatchesPlayed: p.Performances.length,
        AverageScore: parseFloat(avg.toFixed(2)),
      };
    })
    .sort((a, b) => b.AverageScore - a.AverageScore)
    .map((p, i) => ({ ...p, Rank: i + 1 }));

  // Build CSV string
  const headers = ["Rank", "Name", "Position", "Club", "Age", "Matches Played", "Average Score"];
  const rows = scored.map((p) => [
    p.Rank, p.Name, p.Position, p.Club, p.Age, p.MatchesPlayed, p.AverageScore,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const filename = position
    ? `scoutx-rankings-${position.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`
    : `scoutx-rankings-all-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
