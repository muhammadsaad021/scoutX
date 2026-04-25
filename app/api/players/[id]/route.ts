/*
  /api/players/[id] — GET | PUT (update) | DELETE

  Access:
  - GET: any logged-in user
  - PUT: Scout (who created it) or Admin
  - DELETE: Admin only (UC-09)
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth-helpers";

type Params = { params: Promise<{ id: string }> };

// UC-10: GET single player profile
export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const player = await prisma.players.findUnique({
    where: { PlayerID: parseInt(id) },
    include: {
      Performances: { orderBy: { MatchDate: "desc" } },
      ScoutNotes: {
        include: { Users: { select: { Name: true } } },
        orderBy: { CreatedAt: "desc" },
      },
      Users: { select: { Name: true } }, // Scout who created it
    },
  });

  if (!player) {
    return NextResponse.json({ error: "Player not found." }, { status: 404 });
  }

  return NextResponse.json(player);
}

// UC-08: PUT — Update player profile
export async function PUT(req: NextRequest, { params }: Params) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const role = (session?.user as any).role;
  if (role !== "Scout" && role !== "Admin") {
    return NextResponse.json({ error: "Only Scouts or Admins can update player profiles." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, age, position, club, height, weight } = body;

  // UC-08 Alternate: Validate data
  if (age && (isNaN(age) || age < 0 || age > 60)) {
    return NextResponse.json({ error: "Invalid age." }, { status: 400 });
  }
  if (height && (isNaN(height) || height < 100 || height > 230)) {
    return NextResponse.json({ error: "Invalid height (cm)." }, { status: 400 });
  }

  try {
    const updated = await prisma.players.update({
      where: { PlayerID: parseInt(id) },
      data: {
        ...(name && { Name: name }),
        ...(age !== undefined && { Age: parseInt(age) }),
        ...(position && { Position: position }),
        ...(club !== undefined && { Club: club }),
        ...(height !== undefined && { Height: parseFloat(height) }),
        ...(weight !== undefined && { Weight: parseFloat(weight) }),
        UpdatedAt: new Date(),
      },
      select: { PlayerID: true, Name: true, Age: true, Position: true, Club: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update player." }, { status: 500 });
  }
}

// UC-09: DELETE — Admin only
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole("Admin");
  if (error) return error;

  const { id } = await params;

  try {
    await prisma.players.delete({ where: { PlayerID: parseInt(id) } });
    return NextResponse.json({ message: "Player deleted." });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete player." }, { status: 500 });
  }
}
