/*
  /api/players — GET (list all players) | POST (create player)

  GET supports advanced search & filter (Phase 7):
  - q:         name or club text search
  - position:  exact position match
  - club:      partial club name
  - ageMin:    minimum age
  - ageMax:    maximum age
  - sortBy:    Name | Age | Position | CreatedAt (default: CreatedAt)
  - sortOrder: asc | desc (default: desc)

  Access:
  - GET: any logged-in user
  - POST: Scout or Admin only
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Retrieve a list of players
 *     description: Retrieve players with optional advanced search, filter, and pagination.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by player name or club
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *         description: Filter by exact position
 *     responses:
 *       200:
 *         description: A list of players.
 *       401:
 *         description: Unauthorized.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search    = searchParams.get("q") || "";
  const position  = searchParams.get("position") || "";
  const club      = searchParams.get("club") || "";
  const ageMin    = searchParams.get("ageMin") ? parseInt(searchParams.get("ageMin")!) : null;
  const ageMax    = searchParams.get("ageMax") ? parseInt(searchParams.get("ageMax")!) : null;
  const sortBy    = searchParams.get("sortBy") || "CreatedAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  const validSortFields: Record<string, boolean> = {
    Name: true, Age: true, Position: true, CreatedAt: true,
  };
  const orderField = validSortFields[sortBy] ? sortBy : "CreatedAt";

  try {
    const players = await prisma.players.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { Name: { contains: search } },
              { Club: { contains: search } },
            ],
          } : {},
          position ? { Position: position } : {},
          club && !search ? { Club: { contains: club } } : {},
          ageMin !== null ? { Age: { gte: ageMin } } : {},
          ageMax !== null ? { Age: { lte: ageMax } } : {},
        ],
      },
      select: {
        PlayerID: true,
        Name: true,
        Age: true,
        Position: true,
        Club: true,
        Height: true,
        Weight: true,
        CreatedAt: true,
        Users: { select: { Name: true } },
        Performances: {
          where: { CalculatedScore: { not: null } },
          select: { CalculatedScore: true },
        },
      },
      orderBy: { [orderField]: sortOrder },
    });

    // Attach aggregated score per player
    const enriched = players.map((p) => {
      const avgScore = p.Performances.length
        ? parseFloat(
            (p.Performances.reduce((s, perf) => s + (perf.CalculatedScore ?? 0), 0) /
              p.Performances.length).toFixed(1)
          )
        : null;
      const { Performances, ...rest } = p;
      return { ...rest, AverageScore: avgScore, MatchesPlayed: p.Performances.length };
    });

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: "Failed to fetch players." }, { status: 500 });
  }
}

// UC-07: POST — Create player profile (Scout only)
/**
 * @swagger
 * /api/players:
 *   post:
 *     summary: Create a new player
 *     description: Create a new player profile (Scout or Admin only).
 *     tags:
 *       - Players
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - position
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               position:
 *                 type: string
 *               club:
 *                 type: string
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *     responses:
 *       201:
 *         description: Player created successfully.
 *       400:
 *         description: Validation error.
 *       403:
 *         description: Forbidden.
 *       409:
 *         description: Player already exists.
 */
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const role = (session?.user as any).role;
  if (role !== "Scout" && role !== "Admin") {
    return NextResponse.json({ error: "Only Scouts can create player profiles." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, age, position, club, height, weight } = body;

    if (!name || !position) {
      return NextResponse.json({ error: "Name and Position are required." }, { status: 400 });
    }

    const duplicate = await prisma.players.findFirst({
      where: { Name: name, Position: position },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "A player with this name and position already exists." },
        { status: 409 }
      );
    }

    const newPlayer = await prisma.players.create({
      data: {
        Name: name,
        Age: age ? parseInt(age) : null,
        Position: position,
        Club: club || null,
        Height: height ? parseFloat(height) : null,
        Weight: weight ? parseFloat(weight) : null,
        CreatedByScoutID: parseInt(session?.user?.id || "0"),
      },
      select: {
        PlayerID: true, Name: true, Age: true,
        Position: true, Club: true, Height: true, Weight: true, CreatedAt: true,
      },
    });

    return NextResponse.json(newPlayer, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create player." }, { status: 500 });
  }
}
