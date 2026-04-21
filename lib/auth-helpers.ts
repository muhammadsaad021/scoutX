/*
  AUTH HELPERS — Reusable server-side utilities for checking sessions & roles.

  Why do we need this?
  Every API route that requires login must:
    1. Call auth() to get the session
    2. Check if session exists (user is logged in)
    3. Optionally check if the role matches (e.g. Admin only)

  Instead of repeating this in every route file, we centralise it here.
  Any route can call:
    const session = await requireAuth()         → any logged-in user
    const session = await requireRole('Admin')  → Admin only
*/

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function getSession() {
  return await auth();
}

// Returns session if logged in, otherwise returns a 401 response
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 }),
      session: null,
    };
  }
  return { error: null, session };
}

// Returns session if the user has the required role, otherwise returns 403
export async function requireRole(role: string) {
  const { error, session } = await requireAuth();
  if (error) return { error, session: null };

  const userRole = (session!.user as any).role;
  if (userRole !== role) {
    return {
      error: NextResponse.json(
        { error: `Forbidden. Only ${role} users can do this.` },
        { status: 403 }
      ),
      session: null,
    };
  }
  return { error: null, session };
}
