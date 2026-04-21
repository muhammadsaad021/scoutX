/*
  /api/users/[id] — GET (one user) | PUT (update) | DELETE (delete)

  The [id] in the folder name is a "dynamic segment".
  When someone calls DELETE /api/users/5, Next.js puts 5 into params.id.
*/

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

// UC-05: GET single user
export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole("Admin");
  if (error) return error;

  const { id } = await params;
  const userId = parseInt(id);

  const user = await prisma.users.findUnique({
    where: { UserID: userId },
    select: { UserID: true, Name: true, Email: true, Role: true, CreatedAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json(user);
}

// UC-05: PUT — Update user info
export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireRole("Admin");
  if (error) return error;

  const { id } = await params;
  const userId = parseInt(id);
  const body = await req.json();
  const { name, email, role, password } = body;

  // Validate role if provided
  const validRoles = ["Admin", "Scout", "Coach", "Manager"];
  if (role && !validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  try {
    // Build update object dynamically — only update fields that were provided
    const updateData: any = {};
    if (name) updateData.Name = name;
    if (email) updateData.Email = email;
    if (role) updateData.Role = role;
    if (password) updateData.PasswordHash = await bcrypt.hash(password, 10);
    updateData.UpdatedAt = new Date();

    const updated = await prisma.users.update({
      where: { UserID: userId },
      data: updateData,
      select: { UserID: true, Name: true, Email: true, Role: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}

// UC-04: DELETE — Remove user (Admin only)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole("Admin");
  if (error) return error;

  const { id } = await params;
  const userId = parseInt(id);

  try {
    await prisma.users.delete({ where: { UserID: userId } });
    return NextResponse.json({ message: "User deleted successfully." });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}
