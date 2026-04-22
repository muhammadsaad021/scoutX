/*
  /api/watchlists/[id] — GET (single watchlist with players) | DELETE
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const userId = parseInt(session!.user.id!);
  const role = (session!.user as any).role;

  const watchlist = await prisma.watchLists.findUnique({
    where: { WatchListID: parseInt(id) },
    include: {
      WatchListPlayers: {
        include: {
          Players: {
            select: {
              PlayerID: true, Name: true, Position: true,
              Club: true, Age: true, Height: true, Weight: true,
              Performances: {
                where: { CalculatedScore: { not: null } },
                select: { CalculatedScore: true },
              },
            },
          },
        },
        orderBy: { AddedAt: "desc" },
      },
      Users: { select: { Name: true } },
    },
  });

  if (!watchlist) {
    return NextResponse.json({ error: "Watchlist not found." }, { status: 404 });
  }

  // Only owner or Admin can see private watchlists
  if (watchlist.OwnerUserID !== userId && role !== "Admin") {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  // Enrich players with avg score
  const players = watchlist.WatchListPlayers.map((wlp) => {
    const perfs = wlp.Players.Performances;
    const avgScore = perfs.length
      ? parseFloat(
          (perfs.reduce((s, p) => s + (p.CalculatedScore ?? 0), 0) / perfs.length).toFixed(1)
        )
      : null;
    const { Performances, ...playerRest } = wlp.Players;
    return { ...playerRest, AverageScore: avgScore, AddedAt: wlp.AddedAt };
  });

  return NextResponse.json({
    WatchListID: watchlist.WatchListID,
    ListName: watchlist.ListName,
    CreatedAt: watchlist.CreatedAt,
    OwnerName: watchlist.Users?.Name,
    Players: players,
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const userId = parseInt(session!.user.id!);
  const role = (session!.user as any).role;

  const watchlist = await prisma.watchLists.findUnique({
    where: { WatchListID: parseInt(id) },
  });

  if (!watchlist) {
    return NextResponse.json({ error: "Watchlist not found." }, { status: 404 });
  }

  if (watchlist.OwnerUserID !== userId && role !== "Admin") {
    return NextResponse.json({ error: "You can only delete your own watchlists." }, { status: 403 });
  }

  // Delete junction rows first, then the watchlist
  await prisma.watchListPlayers.deleteMany({ where: { WatchListID: parseInt(id) } });
  await prisma.watchLists.delete({ where: { WatchListID: parseInt(id) } });

  return NextResponse.json({ message: "Watchlist deleted." });
}
