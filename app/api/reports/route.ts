/*
  /api/reports — GET

  Returns a list of all previously generated reports.
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const reports = await prisma.reports.findMany({
      include: {
        Players: { select: { Name: true, Position: true } },
        Users: { select: { Name: true } },
      },
      orderBy: { GeneratedDate: "desc" },
    });

    return NextResponse.json(reports);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch reports history." }, { status: 500 });
  }
}
