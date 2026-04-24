"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Exclude sidebar from auth pages
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {!isAuthPage && <Sidebar />}
      <main style={{ 
        flex: 1, 
        marginLeft: isAuthPage ? 0 : "260px",
        padding: "0",
        minHeight: "100vh",
      }}>
        {children}
      </main>
    </div>
  );
}
