/*
  /api/watchlists/[id]/players — POST (add player)

  Adds a player to the watchlist. Prevents duplicates.
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const watchListID = parseInt(id);
  const userId = parseInt(session!.user.id!);
  const role = (session!.user as any).role;

  // Verify ownership
  const watchlist = await prisma.watchLists.findUnique({
    where: { WatchListID: watchListID },
  });
  if (!watchlist) {
    return NextResponse.json({ error: "Watchlist not found." }, { status: 404 });
  }
  if (watchlist.OwnerUserID !== userId && role !== "Admin") {
    return NextResponse.json({ error: "You can only modify your own watchlists." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { playerID } = body;

    if (!playerID) {
      return NextResponse.json({ error: "playerID is required." }, { status: 400 });
    }

    // Confirm player exists
    const player = await prisma.players.findUnique({ where: { PlayerID: parseInt(playerID) } });
    if (!player) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    // Check if already in watchlist
    const alreadyIn = await prisma.watchListPlayers.findUnique({
      where: {
        WatchListID_PlayerID: {
          WatchListID: watchListID,
          PlayerID: parseInt(playerID),
        },
      },
    });
    if (alreadyIn) {
      return NextResponse.json(
        { error: `${player.Name} is already in this watchlist.` },
        { status: 409 }
      );
    }

    await prisma.watchListPlayers.create({
      data: { WatchListID: watchListID, PlayerID: parseInt(playerID) },
    });

    return NextResponse.json({ message: `${player.Name} added to watchlist.` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add player." }, { status: 500 });
  }
}
