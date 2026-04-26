import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@scoutx.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.users.findUnique({
          where: { Email: credentials.email as string },
        });

        // Reject if user not found or has no password hash
        if (!user || !user.PasswordHash) {
          throw new Error("Invalid credentials");
        }

        // Compare entered password with hashed password
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.PasswordHash
        );

        if (!passwordMatch) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.UserID.toString(),
          name: user.Name,
          email: user.Email,
          // We attach role here manually since we need to know if they are Admin!
          role: user.Role,
          createdAt: user.CreatedAt,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login", // We'll build this page next
  },
});
