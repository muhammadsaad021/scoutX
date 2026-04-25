"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/players/new", label: "Add Player", icon: "➕" },
    { href: "/watchlists", label: "Watchlists", icon: "📋" },
    { href: "/rankings", label: "Rankings", icon: "🏆" },
    { href: "/search", label: "Database", icon: "🔍" },
  ];

  return (
    <div style={{
      width: "260px",
      height: "100vh",
      background: "var(--bg-card)",
      borderRight: "1px solid var(--border-color)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      left: 0,
      top: 0,
      padding: "2rem 1rem",
    }}>
      {/* Brand */}
      <div style={{ marginBottom: "3rem", paddingLeft: "1rem" }}>
        <h1 style={{ color: "var(--primary)", fontSize: "1.75rem", margin: 0, letterSpacing: "-1px" }}>scoutX</h1>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} style={{
              display: "flex", alignItems: "center", gap: "1rem", padding: "0.875rem 1rem",
              borderRadius: "var(--radius-sm)", textDecoration: "none",
              background: isActive ? "var(--bg-input)" : "transparent",
              color: isActive ? "var(--primary)" : "var(--text-secondary)",
              fontWeight: isActive ? 600 : 500,
              transition: "all 0.2s ease",
              borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent"
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "var(--bg-primary)";
                e.currentTarget.style.color = "var(--text-primary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }
            }}>
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile / Logout */}
      {session?.user && (
        <div style={{ 
          marginTop: "auto", 
          padding: "1rem", 
          background: "var(--bg-primary)", 
          borderRadius: "var(--radius-md)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>{session.user.name}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{(session.user as any).role}</div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ 
              background: "none", border: "none", color: "var(--danger)", 
              cursor: "pointer", padding: "0.5rem", borderRadius: "var(--radius-sm)" 
            }}
            title="Log Out"
          >
            🚪
          </button>
        </div>
      )}
    </div>
  );
}
