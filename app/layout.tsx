import type { Metadata } from "next";
import "./globals.css";

/*
  ROOT LAYOUT — This wraps EVERY page in the app.
  
  Think of it like a "master template":
  - The <html> and <body> tags live here (only once in the whole app)
  - {children} is where each page's content gets inserted
  - globals.css is imported here so styles apply everywhere
  
  When you visit /dashboard, Next.js renders:
    RootLayout → DashboardPage inside {children}
*/

export const metadata: Metadata = {
  title: "ScoutX — Talent Scouting Platform",
  description:
    "Professional football talent scouting, player ranking, and performance tracking platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
