/*
  /api/watchlists — GET (my watchlists) | POST (create watchlist)

  Access:
  - GET: Any logged-in user sees their own watchlists
  - POST: Coach, Manager, Admin can create watchlists
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const userId = parseInt(session!.user.id!);

  try {
    const watchlists = await prisma.watchLists.findMany({
      where: { OwnerUserID: userId },
      include: {
        WatchListPlayers: {
          include: {
            Players: {
              select: { PlayerID: true, Name: true, Position: true, Club: true },
            },
          },
        },
      },
      orderBy: { CreatedAt: "desc" },
    });

    // Reshape for cleaner API response
    const shaped = watchlists.map((wl) => ({
      WatchListID: wl.WatchListID,
      ListName: wl.ListName,
      CreatedAt: wl.CreatedAt,
      PlayerCount: wl.WatchListPlayers.length,
      Players: wl.WatchListPlayers.map((wlp) => wlp.Players),
    }));

    return NextResponse.json(shaped);
  } catch {
    return NextResponse.json({ error: "Failed to fetch watchlists." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const role = (session!.user as any).role;
  if (role !== "Coach" && role !== "Manager" && role !== "Admin") {
    return NextResponse.json(
      { error: "Only Coaches, Managers or Admins can create watchlists." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { listName } = body;

    if (!listName || listName.trim().length === 0) {
      return NextResponse.json({ error: "Watchlist name is required." }, { status: 400 });
    }

    const userId = parseInt(session!.user.id!);

    // Prevent duplicate names for the same user
    const existing = await prisma.watchLists.findFirst({
      where: { ListName: listName.trim(), OwnerUserID: userId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already have a watchlist with this name." },
        { status: 409 }
      );
    }

    const watchlist = await prisma.watchLists.create({
      data: {
        ListName: listName.trim(),
        OwnerUserID: userId,
      },
    });

    return NextResponse.json(watchlist, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create watchlist." }, { status: 500 });
  }
}
