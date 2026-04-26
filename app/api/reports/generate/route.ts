/*
  /api/reports/generate — POST

  UC-20: Generate Report
  Logs the report generation in the Reports table and returns the player's full
  dossier (profile, performances, notes) so the frontend can build the PDF.
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

/**
 * @swagger
 * /api/reports/generate:
 *   post:
 *     summary: Generate player report
 *     description: Generate and log a full dossier report for a player.
 *     tags:
 *       - Reports
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerID
 *             properties:
 *               playerID:
 *                 type: integer
 *               format:
 *                 type: string
 *                 default: PDF
 *     responses:
 *       200:
 *         description: Report data generated successfully.
 *       400:
 *         description: Missing data or validation error.
 *       404:
 *         description: Player not found.
 */
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const { playerID, format = "PDF" } = body;

    if (!playerID) {
      return NextResponse.json({ error: "playerID is required." }, { status: 400 });
    }

    const userId = parseInt(session?.user?.id || "0");

    // Fetch the player's full dossier
    const player = await prisma.players.findUnique({
      where: { PlayerID: parseInt(playerID) },
      include: {
        Performances: {
          orderBy: { MatchDate: "desc" },
        },
        ScoutNotes: {
          include: { Users: { select: { Name: true } } },
          orderBy: { CreatedAt: "desc" },
        },
        Users: { select: { Name: true } },
      },
    });

    if (!player) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    // UC-20 Alternate: handle "no data available" (e.g., if a report needs at least 1 performance)
    if (player.Performances.length === 0 && player.ScoutNotes.length === 0) {
      return NextResponse.json({ 
        error: "Cannot generate report: No performance data or scout notes available for this player." 
      }, { status: 400 });
    }

    // Log the report generation
    await prisma.reports.create({
      data: {
        PlayerID: player.PlayerID,
        GeneratedByUserID: userId,
        Format: format,
      },
    });

    // Calculate aggregated stats
    const matches = player.Performances.length;
    const totalGoals = player.Performances.reduce((s, p) => s + (p.Goals ?? 0), 0);
    const totalAssists = player.Performances.reduce((s, p) => s + (p.Assists ?? 0), 0);
    const avgScore = matches
      ? parseFloat(
          (
            player.Performances.reduce((s, p) => s + (p.CalculatedScore ?? 0), 0) / matches
          ).toFixed(1)
        )
      : null;

    return NextResponse.json({
      player: {
        ...player,
        TotalGoals: totalGoals,
        TotalAssists: totalAssists,
        AverageScore: avgScore,
        MatchesPlayed: matches,
      },
      message: "Report data generated.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate report." }, { status: 500 });
  }
}
