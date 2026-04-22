/*
  /api/players/[id]/charts — GET

  UC-21: View Performance Charts
  Returns performance data formatted specifically for visualization (Recharts).
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const playerID = parseInt(id);

  try {
    const performances = await prisma.performances.findMany({
      where: { PlayerID: playerID },
      orderBy: { MatchDate: "asc" },
    });

    if (performances.length === 0) {
      return NextResponse.json({ message: "No performance data available." }, { status: 404 });
    }

    // Format data for Line/Bar charts (chronological)
    const timelineData = performances.map((p, index) => ({
      matchName: `Match ${index + 1}`,
      date: p.MatchDate ? new Date(p.MatchDate).toLocaleDateString() : `M${index + 1}`,
      Goals: p.Goals ?? 0,
      Assists: p.Assists ?? 0,
      Passes: p.Passes ?? 0,
      Rating: p.Rating ?? 0,
      Score: p.CalculatedScore ?? 0,
    }));

    // Format data for Radar chart (aggregates)
    const matches = performances.length;
    const avgGoals = performances.reduce((s, p) => s + (p.Goals ?? 0), 0) / matches;
    const avgAssists = performances.reduce((s, p) => s + (p.Assists ?? 0), 0) / matches;
    const avgPasses = performances.reduce((s, p) => s + (p.Passes ?? 0), 0) / matches;
    const avgRating = performances.reduce((s, p) => s + (p.Rating ?? 0), 0) / matches;
    const avgScore = performances.reduce((s, p) => s + (p.CalculatedScore ?? 0), 0) / matches;

    // We normalize the values for radar display (rough out of 100)
    // Goals/Assists scale up, Rating is /10, etc.
    const radarData = [
      { subject: "Rating", value: avgRating * 10, fullMark: 100 },
      { subject: "Score", value: Math.min(avgScore, 100), fullMark: 100 },
      { subject: "Goals", value: Math.min(avgGoals * 20, 100), fullMark: 100 },
      { subject: "Assists", value: Math.min(avgAssists * 25, 100), fullMark: 100 },
      { subject: "Passes", value: Math.min(avgPasses * 1.5, 100), fullMark: 100 },
    ];

    return NextResponse.json({
      timeline: timelineData,
      radar: radarData,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load chart data." }, { status: 500 });
  }
}
