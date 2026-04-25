"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user as any)?.role;

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/players", label: "Players", icon: "group" },
  ];

  if (userRole === "Manager") {
    links.push({ href: "/watchlists", label: "Watchlist", icon: "bookmark" });
  } else {
    links.push({ href: "/players/new", label: "Add Player", icon: "person_add" });
  }

  links.push({ href: "/rankings", label: "Rankings", icon: "leaderboard" });
  links.push({ href: "/profile", label: "Profile", icon: "account_circle" });

  return (
    <>
      <style>{`
        .scoutx-sidebar {
          width: 260px;
          height: 100vh;
          background-color: #000000;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 50;
          font-family: 'Inter', sans-serif;
        }
        .scoutx-sidebar-logo-container {
          padding: 2rem;
        }
        .scoutx-sidebar-logo {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.05em;
          color: #a3e635;
          margin: 0;
        }
        .scoutx-sidebar-nav {
          flex: 1;
          padding-top: 1rem;
          padding-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .scoutx-sidebar-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 2rem;
          text-decoration: none;
          transition: color 0.2s;
          border-right: 4px solid transparent;
        }
        .scoutx-sidebar-link.active {
          color: #a3e635;
          background-color: #000000;
          border-right-color: #a3e635;
        }
        .scoutx-sidebar-link:not(.active) {
          color: #a1a1aa;
        }
        .scoutx-sidebar-link:not(.active):hover {
          color: #e4e4e7;
        }
        .scoutx-sidebar-icon {
          font-family: 'Material Symbols Outlined';
          font-size: 24px;
        }
        .scoutx-sidebar-link.active .material-symbols-outlined {
          font-variation-settings: 'FILL' 1;
        }
        .scoutx-sidebar-label {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
        }
        .scoutx-sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #0a0a0a;
          margin-top: auto;
        }
        .scoutx-sidebar-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .scoutx-sidebar-avatar {
          width: 40px;
          height: 40px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background-color: #27272a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
        }
        .scoutx-sidebar-user-name {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }
        .scoutx-sidebar-user-role {
          font-size: 10px;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
          margin-top: 0.25rem;
        }
        .scoutx-sidebar-logout {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .scoutx-sidebar-logout:hover {
          color: #f87171;
        }
      `}</style>

      <div className="scoutx-sidebar">
        {/* Brand */}
        <div className="scoutx-sidebar-logo-container">
          <h1 className="scoutx-sidebar-logo">scoutX</h1>
        </div>

        {/* Navigation */}
        <nav className="scoutx-sidebar-nav">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href) && (link.href !== "/players" || pathname === "/players");
            if (link.href === "/dashboard") {
              // Exact match for dashboard
              var isDashActive = pathname === "/dashboard";
              return (
                <Link key={link.href} href={link.href} className={`scoutx-sidebar-link ${isDashActive ? 'active' : ''}`}>
                  <span className="material-symbols-outlined scoutx-sidebar-icon">{link.icon}</span>
                  <span className="scoutx-sidebar-label">{link.label}</span>
                </Link>
              );
            }
            return (
              <Link key={link.href} href={link.href} className={`scoutx-sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="material-symbols-outlined scoutx-sidebar-icon">{link.icon}</span>
                <span className="scoutx-sidebar-label">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        {session?.user && (
          <div className="scoutx-sidebar-footer">
            <div className="scoutx-sidebar-profile">
              <div className="scoutx-sidebar-avatar">
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="scoutx-sidebar-user-name">{session.user.name}</p>
                <p className="scoutx-sidebar-user-role">{(session.user as any).role}</p>
              </div>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="scoutx-sidebar-logout"
              title="Log Out"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
