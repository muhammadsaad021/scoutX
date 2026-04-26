/*
  /api/users — GET (list all users) | POST (create new user)

  In Next.js App Router, each file in /app/api/ is a backend endpoint.
  You export named functions: GET, POST, PUT, DELETE — each matches an HTTP method.

  These are "Server-only" functions — they run on the server, have access to
  the database, and are never exposed to the browser.
*/

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";

// UC-03 / UC-05 supporting: GET all users (Admin only)
export async function GET() {
  const { error } = await requireRole("Admin");
  if (error) return error;

  try {
    const users = await prisma.users.findMany({
      select: {
        UserID: true,
        Name: true,
        Email: true,
        Role: true,
        CreatedAt: true,
      },
      orderBy: { CreatedAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Allow open registration for Scout/Manager roles. (In production, restrict Admin creation)

  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Validate role value
    const validRoles = ["Scout", "Coach", "Manager"];
    if (role === "Admin") {
      return NextResponse.json({ error: "Administrative accounts cannot be created via public registration." }, { status: 403 });
    }
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    // UC-03 Alternate: Check for duplicate email
    const existing = await prisma.users.findUnique({ where: { Email: email } });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        Name: name,
        Email: email,
        PasswordHash: hashedPassword,
        Role: role,
      },
      select: { UserID: true, Name: true, Email: true, Role: true, CreatedAt: true },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
  }
}
