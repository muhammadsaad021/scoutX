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
      <body>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
