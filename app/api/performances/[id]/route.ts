/*
  /api/performances/[id] — GET | PUT | DELETE

  UC-12: Scout edits a specific performance record.
  Recalculates the score when stats are updated.
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { calculatePerformanceScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const perf = await prisma.performances.findUnique({
    where: { PerformanceID: parseInt(id) },
  });

  if (!perf) {
    return NextResponse.json({ error: "Performance record not found." }, { status: 404 });
  }
  return NextResponse.json(perf);
}

// UC-12: Edit performance data
export async function PUT(req: NextRequest, { params }: Params) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const role = (session?.user as any).role;
  if (role !== "Scout" && role !== "Admin") {
    return NextResponse.json({ error: "Only Scouts can edit performance data." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { matchDate, goals, assists, passes, rating, comments } = body;

  if (rating !== undefined && (rating < 0 || rating > 10)) {
    return NextResponse.json({ error: "Rating must be between 0 and 10." }, { status: 400 });
  }

  try {
    // Fetch current record to fill in any fields not being updated
    const existing = await prisma.performances.findUnique({
      where: { PerformanceID: parseInt(id) },
    });
    if (!existing) {
      return NextResponse.json({ error: "Performance record not found." }, { status: 404 });
    }

    const newGoals = goals !== undefined ? parseInt(goals) : existing.Goals ?? 0;
    const newAssists = assists !== undefined ? parseInt(assists) : existing.Assists ?? 0;
    const newPasses = passes !== undefined ? parseInt(passes) : existing.Passes ?? 0;
    const newRating = rating !== undefined ? parseFloat(rating) : existing.Rating ?? 0;

    // Recalculate score with updated stats
    const calculatedScore = calculatePerformanceScore(newGoals, newAssists, newPasses, newRating);

    const updated = await prisma.performances.update({
      where: { PerformanceID: parseInt(id) },
      data: {
        ...(matchDate && { MatchDate: new Date(matchDate) }),
        Goals: newGoals,
        Assists: newAssists,
        Passes: newPasses,
        Rating: newRating,
        Comments: comments !== undefined ? comments : existing.Comments,
        CalculatedScore: calculatedScore,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Performance record not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update performance." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.performances.delete({ where: { PerformanceID: parseInt(id) } });
    return NextResponse.json({ message: "Performance record deleted." });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}
