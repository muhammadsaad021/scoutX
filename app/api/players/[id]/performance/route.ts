/*
  /api/players/[id]/performance — POST

  UC-11: Scout enters performance data for a match.
  Automatically calculates and stores the CalculatedScore using our scoring formula.
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { calculatePerformanceScore } from "@/lib/scoring";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const role = (session!.user as any).role;
  if (role !== "Scout" && role !== "Admin") {
    return NextResponse.json({ error: "Only Scouts can enter performance data." }, { status: 403 });
  }

  const { id } = await params;
  const playerID = parseInt(id);

  // UC-11 Alternate: confirm the player exists first
  const player = await prisma.players.findUnique({ where: { PlayerID: playerID } });
  if (!player) {
    return NextResponse.json({ error: "Player not found." }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { matchDate, goals, assists, passes, rating, comments } = body;

    // UC-11 Alternate: Validate required fields
    if (!matchDate) {
      return NextResponse.json({ error: "Match date is required." }, { status: 400 });
    }
    if (goals === undefined || assists === undefined || passes === undefined) {
      return NextResponse.json({ error: "Goals, Assists, and Passes are required." }, { status: 400 });
    }
    if (rating !== undefined && (rating < 0 || rating > 10)) {
      return NextResponse.json({ error: "Rating must be between 0 and 10." }, { status: 400 });
    }

    // Auto-calculate the performance score using our formula
    const calculatedScore = calculatePerformanceScore(
      parseInt(goals),
      parseInt(assists),
      parseInt(passes),
      rating ? parseFloat(rating) : 0
    );

    const performance = await prisma.performances.create({
      data: {
        PlayerID: playerID,
        ScoutID: parseInt(session!.user.id!),
        MatchDate: new Date(matchDate),
        Goals: parseInt(goals) || 0,
        Assists: parseInt(assists) || 0,
        Passes: parseInt(passes) || 0,
        Rating: rating ? parseFloat(rating) : null,
        Comments: comments || null,
        CalculatedScore: calculatedScore,
      },
    });

    return NextResponse.json(performance, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save performance data." }, { status: 500 });
  }
}
