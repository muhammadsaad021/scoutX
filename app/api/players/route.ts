/*
  /api/players — GET (list all players) | POST (create player)

  Access:
  - GET: Scout, Coach, Manager, Admin can all view players
  - POST: Scout only (they are the ones who add new players)
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") || "";
  const position = searchParams.get("position") || "";

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
        Users: { select: { Name: true } }, // Scout who created the player
      },
      orderBy: { CreatedAt: "desc" },
    });

    return NextResponse.json(players);
  } catch {
    return NextResponse.json({ error: "Failed to fetch players." }, { status: 500 });
  }
}

// UC-07: POST — Create player profile (Scout only)
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  // Only Scouts (and Admin) can create players
  const role = (session!.user as any).role;
  if (role !== "Scout" && role !== "Admin") {
    return NextResponse.json({ error: "Only Scouts can create player profiles." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, age, position, club, height, weight } = body;

    if (!name || !position) {
      return NextResponse.json({ error: "Name and Position are required." }, { status: 400 });
    }

    // UC-07 Alternate: Duplicate player detection (same name + position)
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
        CreatedByScoutID: parseInt(session!.user.id!),
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
