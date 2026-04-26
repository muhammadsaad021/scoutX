import type { NextAuthConfig } from "next-auth";

export default {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.createdAt = (user as any).createdAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        (session.user as any).role = token.role;
        (session.user as any).createdAt = token.createdAt;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
