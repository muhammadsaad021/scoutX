import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Use the smaller edge-compatible configuration here
const { auth } = NextAuth(authConfig);

const publicRoutes = ["/", "/login", "/register"];
const authRoutes = ["/login", "/register"];
const apiAuthPrefix = "/api/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth; // Checks if a valid session exists

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // 1. Let NextAuth internal API routes process normally
  if (isApiAuthRoute) {
    return;
  }

  // 2. If trying to visit Login page while already logged in -> kick them to dashboard
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  // 3. If accessing a protected route (e.g. /dashboard) without being logged in -> kick to /login
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  return;
});

// Configure where the middleware should run
export const config = {
  // It runs on every path EXCEPT those matching the regex below (images, static files, _next, etc.)
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
