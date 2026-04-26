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

  if (userRole === "Manager" || userRole === "Scout") {
    links.push({ href: "/watchlists", label: "Watchlist", icon: "bookmark" });
  }

  if (userRole === "Scout" || userRole === "Admin" || userRole === "Coach") {
    links.push({ href: "/players/new", label: "Add Player", icon: "person_add" });
  }

  links.push({ href: "/rankings", label: "Rankings", icon: "leaderboard" });

  if (userRole === "Admin") {
    links.push({ href: "/admin/users", label: "Users", icon: "manage_accounts" });
  }

  links.push({ href: "/profile", label: "Profile", icon: "account_circle" });

  return (
    <>
      <style>{`
        .scoutx-sidebar {
          width: 260px;
          height: 100vh;
          background-color: var(--color-bg-body);
          border-right: 1px solid var(--color-border-subtle);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 50;
          font-family: var(--font-body);
        }
        .scoutx-sidebar-logo-container {
          padding: var(--space-xl);
        }
        .scoutx-sidebar-logo {
          font-family: var(--font-heading);
          font-size: 28px;
          font-weight: var(--fw-black);
          letter-spacing: -0.05em;
          color: var(--color-primary);
          margin: 0;
        }
        .scoutx-sidebar-nav {
          flex: 1;
          padding-top: var(--space-md);
          padding-bottom: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        .scoutx-sidebar-link {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md) var(--space-xl);
          text-decoration: none;
          transition: color var(--transition-normal);
          border-right: 4px solid transparent;
        }
        .scoutx-sidebar-link.active {
          color: var(--color-primary);
          background-color: var(--color-bg-body);
          border-right-color: var(--color-primary);
        }
        .scoutx-sidebar-link:not(.active) {
          color: var(--color-text-ghost);
        }
        .scoutx-sidebar-link:not(.active):hover {
          color: var(--color-text-secondary);
        }
        .scoutx-sidebar-icon {
          font-family: 'Material Symbols Outlined';
          font-size: 24px;
        }
        .scoutx-sidebar-link.active .material-symbols-outlined {
          font-variation-settings: 'FILL' 1;
        }
        .scoutx-sidebar-label {
          font-family: var(--font-heading);
          font-weight: var(--fw-bold);
          font-size: var(--text-base);
        }
        .scoutx-sidebar-footer {
          padding: var(--space-lg);
          border-top: 1px solid var(--color-border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--color-bg-elevated);
          margin-top: auto;
        }
        .scoutx-sidebar-profile {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        .scoutx-sidebar-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border-subtle);
          background-color: var(--color-bg-surface-2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-primary);
          font-family: var(--font-heading);
          font-weight: var(--fw-bold);
        }
        .scoutx-sidebar-user-name {
          font-size: var(--text-base);
          font-weight: var(--fw-bold);
          color: var(--color-text-primary);
          margin: 0;
          line-height: var(--lh-snug);
        }
        .scoutx-sidebar-user-role {
          font-size: var(--text-xs);
          color: var(--color-text-ghost);
          text-transform: uppercase;
          letter-spacing: var(--ls-wide);
          margin: 0;
          margin-top: var(--space-xs);
        }
        .scoutx-sidebar-logout {
          background: none;
          border: none;
          color: var(--color-danger);
          cursor: pointer;
          padding: var(--space-sm);
          transition: color var(--transition-normal);
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
