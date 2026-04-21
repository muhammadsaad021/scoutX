/*
  /api/players/[id]/notes — POST

  UC-13: Scout adds a note to a player's profile.
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const role = (session!.user as any).role;
  if (role !== "Scout" && role !== "Admin") {
    return NextResponse.json({ error: "Only Scouts can add notes." }, { status: 403 });
  }

  const { id } = await params;
  const playerID = parseInt(id);

  const player = await prisma.players.findUnique({ where: { PlayerID: playerID } });
  if (!player) {
    return NextResponse.json({ error: "Player not found." }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { noteText } = body;

    if (!noteText || noteText.trim().length === 0) {
      return NextResponse.json({ error: "Note text cannot be empty." }, { status: 400 });
    }

    const note = await prisma.scoutNotes.create({
      data: {
        PlayerID: playerID,
        ScoutID: parseInt(session!.user.id!),
        NoteText: noteText.trim(),
      },
      include: {
        Users: { select: { Name: true } },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save note." }, { status: 500 });
  }
}
