/*
  /api/watchlists/[id]/players/[playerId] — DELETE (remove player from watchlist)
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

type Params = { params: Promise<{ id: string; playerId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id, playerId } = await params;
  const watchListID = parseInt(id);
  const playerID = parseInt(playerId);
  const userId = parseInt(session?.user?.id || "0");
  const role = (session?.user as any)?.role;

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
    await prisma.watchListPlayers.delete({
      where: {
        WatchListID_PlayerID: { WatchListID: watchListID, PlayerID: playerID },
      },
    });
    return NextResponse.json({ message: "Player removed from watchlist." });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Player not in this watchlist." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to remove player." }, { status: 500 });
  }
}
