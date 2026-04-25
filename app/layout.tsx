import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import ClientLayout from "@/components/ClientLayout";

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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Space+Grotesk:wght@600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
