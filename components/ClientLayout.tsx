"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Exclude sidebar from auth pages
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/";

  return (
    <>
      <style>{`
        .scoutx-app-shell {
          display: flex;
          min-height: 100vh;
        }
        .scoutx-app-main {
          flex: 1;
          padding: 0;
          min-height: 100vh;
        }
        .scoutx-app-main--with-sidebar {
          margin-left: 260px;
        }
      `}</style>
      <div className="scoutx-app-shell">
        {!isAuthPage && <Sidebar />}
        <main className={`scoutx-app-main ${!isAuthPage ? 'scoutx-app-main--with-sidebar' : ''}`}>
          {children}
        </main>
      </div>
    </>
  );
}
