import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const SCORE_COLOR = (score: number | null) => {
  if (!score) return "var(--text-muted)";
  if (score >= 60) return "var(--success)";
  if (score >= 30) return "var(--warning)";
  return "var(--danger)";
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // 1. Total players count
  const totalPlayers = await prisma.players.count();

  // 2. Total scouts/users count
  const totalUsers = await prisma.users.count();
  const totalScouts = await prisma.users.count({ where: { Role: "Scout" } });

  // 3. Recent evaluations (last 5 performances)
  const recentPerformances = await prisma.performances.findMany({
    take: 5,
    orderBy: { CreatedAt: "desc" },
    include: {
      Players: { select: { Name: true, Position: true } },
      Users: { select: { Name: true } },
    },
  });

  // 4. Top-ranked players summary
  const allPlayers = await prisma.players.findMany({
    include: {
      Performances: {
        where: { CalculatedScore: { not: null } },
        select: { CalculatedScore: true },
      },
    },
  });

  const rankedPlayers = allPlayers
    .map((p) => {
      const perfs = p.Performances;
      const avgScore = perfs.length
        ? parseFloat((perfs.reduce((s, perf) => s + (perf.CalculatedScore ?? 0), 0) / perfs.length).toFixed(1))
        : 0;
      return {
        PlayerID: p.PlayerID,
        Name: p.Name,
        Position: p.Position,
        AverageScore: avgScore,
      };
    })
    .filter((p) => p.AverageScore > 0)
    .sort((a, b) => b.AverageScore - a.AverageScore)
    .slice(0, 3); // Top 3

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Dashboard</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Welcome back, <strong style={{ color: "var(--text-primary)" }}>{session.user.name}</strong> 
            <span className="badge badge-primary" style={{ marginLeft: "0.5rem" }}>{(session.user as any).role}</span>
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button type="submit" className="btn btn-secondary">
            Log Out
          </button>
        </form>
      </div>

      {/* Top Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="card animate-slide-in" style={{ display: "flex", flexDirection: "column", justifyContent: "center", borderLeft: "4px solid var(--primary)" }}>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "0.5rem" }}>
            Total Players
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--primary)" }}>
            {totalPlayers}
          </div>
        </div>

        <div className="card animate-slide-in" style={{ display: "flex", flexDirection: "column", justifyContent: "center", borderLeft: "4px solid var(--primary)", animationDelay: "0.1s" }}>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "0.5rem" }}>
            Active Scouts
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--primary)" }}>
            {totalScouts} <span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--text-muted)" }}>/ {totalUsers} total users</span>
          </div>
        </div>

        <div className="card animate-slide-in" style={{ display: "flex", flexDirection: "column", justifyContent: "center", borderLeft: "4px solid var(--primary)", animationDelay: "0.2s" }}>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "0.5rem" }}>
            Total Evaluations
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--primary)" }}>
            {await prisma.performances.count()}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        
        {/* Recent Evaluations */}
        <div className="card animate-slide-in" style={{ animationDelay: "0.3s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Recent Evaluations</h3>
          </div>
          {recentPerformances.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No evaluations recorded yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {recentPerformances.map((perf) => (
                <div key={perf.PerformanceID} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                  <div>
                    <Link href={`/players/${perf.PlayerID}`} style={{ fontWeight: 600, color: "var(--text-primary)", textDecoration: "none" }}>
                      {perf.Players?.Name}
                    </Link>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      Scouted by {perf.Users?.Name} · {perf.MatchDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: SCORE_COLOR(perf.CalculatedScore) }}>
                    {perf.CalculatedScore?.toFixed(1) ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Ranked Players */}
        <div className="card animate-slide-in" style={{ animationDelay: "0.4s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Top Ranked Players</h3>
            <Link href="/rankings" style={{ fontSize: "0.875rem", color: "var(--primary)" }}>View All →</Link>
          </div>
          {rankedPlayers.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No ranked players available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {rankedPlayers.map((player, index) => (
                <div key={player.PlayerID} style={{ display: "flex", alignItems: "center", gap: "1rem", paddingBottom: "1rem", borderBottom: index < rankedPlayers.length - 1 ? "1px solid var(--border-color)" : "none" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: index === 0 ? "#CD7F32" : "var(--text-muted)", width: "30px", textAlign: "center" }}>
                    #{index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link href={`/players/${player.PlayerID}`} style={{ fontWeight: 600, color: "var(--text-primary)", textDecoration: "none" }}>
                      {player.Name}
                    </Link>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      {player.Position}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: SCORE_COLOR(player.AverageScore), fontSize: "1.1rem" }}>
                    {player.AverageScore.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <h3 style={{ marginBottom: "1rem" }}>Quick Access</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <Link href="/players/new" style={{ textDecoration: "none" }}>
          <div className="card animate-slide-in" style={{ textAlign: "center", padding: "1.5rem", animationDelay: "0.5s" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>➕</div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Add Player</div>
          </div>
        </Link>
        <Link href="/search" style={{ textDecoration: "none" }}>
          <div className="card animate-slide-in" style={{ textAlign: "center", padding: "1.5rem", animationDelay: "0.6s" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Advanced Search</div>
          </div>
        </Link>
        <Link href="/compare" style={{ textDecoration: "none" }}>
          <div className="card animate-slide-in" style={{ textAlign: "center", padding: "1.5rem", animationDelay: "0.7s" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚖️</div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Compare Players</div>
          </div>
        </Link>
        <Link href="/watchlists" style={{ textDecoration: "none" }}>
          <div className="card animate-slide-in" style={{ textAlign: "center", padding: "1.5rem", animationDelay: "0.8s" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>My Watchlists</div>
          </div>
        </Link>
      </div>

    </div>
  );
}
