import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const SCORE_COLOR_HEX = (score: number | null) => {
  if (!score) return "#71717a"; // zinc-500
  if (score >= 70) return "#a3e635"; // lime-400
  if (score >= 40) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  const isScout = role === "Scout";
  const userId = parseInt(session.user.id || "0");

  // 1. Total players count (Scout sees their own, others see all)
  const totalPlayers = isScout 
    ? await prisma.players.count({ where: { CreatedByScoutID: userId } })
    : await prisma.players.count();

  // 2. Total scouts/users count
  const totalUsers = await prisma.users.count();
  const totalScouts = await prisma.users.count({ where: { Role: "Scout" } });

  // 3. Recent evaluations (last 5 performances)
  const recentPerformances = await prisma.performances.findMany({
    take: 5,
    orderBy: { CreatedAt: "desc" },
    where: isScout ? { ScoutID: userId } : undefined,
    include: {
      Players: { select: { Name: true, Position: true } },
      Users: { select: { Name: true } },
    },
  });

  const totalEvaluations = isScout
    ? await prisma.performances.count({ where: { ScoutID: userId } })
    : await prisma.performances.count();

  // 4. All players count
  const totalDbPlayers = await prisma.players.count();

  return (
    <>
      <style>{`
        .scoutx-dashboard-bg {
          background-color: #000000;
          min-height: 100vh;
          width: 100%;
        }
        .scoutx-dashboard-inner {
          padding: 3rem;
          max-width: 1200px;
        }
        .scoutx-dash-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin-bottom: 3rem;
          margin-top: 0;
        }
        .scoutx-metrics-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        @media (min-width: 768px) {
          .scoutx-metrics-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .scoutx-metric-card {
          background-color: #1e1e1e;
          padding: 1.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 120px;
        }
        .scoutx-metric-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.25rem;
        }
        .scoutx-metric-value-row {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }
        .scoutx-metric-value {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 42px;
          line-height: 1;
        }
        .scoutx-metric-desc {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #71717a;
          max-width: 100px;
          line-height: 1.2;
        }

        .scoutx-table-section {
          background-color: #222222;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 3rem;
        }
        .scoutx-table-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .scoutx-table-title {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.025em;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0;
        }
        .scoutx-table-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background-color: #a3e635;
        }
        .scoutx-table-btn {
          background-color: #a3e635;
          color: #000000;
          font-weight: 700;
          font-size: 12px;
          padding: 0.625rem 1.5rem;
          border-radius: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          transition: background-color 0.2s;
          border: none;
          cursor: pointer;
        }
        .scoutx-table-btn:hover {
          background-color: #bef264;
        }
        .scoutx-table-wrapper {
          overflow-x: auto;
        }
        .scoutx-table {
          width: 100%;
          text-align: left;
          border-collapse: collapse;
        }
        .scoutx-table th {
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 10px;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .scoutx-table td {
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #d4d4d8;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .scoutx-table tbody tr {
          transition: background-color 0.2s;
        }
        .scoutx-table tbody tr:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .scoutx-pos-badge {
          padding: 0.25rem 0.5rem;
          font-size: 10px;
          font-weight: 700;
          border-radius: 0.25rem;
          display: inline-block;
          background-color: rgba(13, 148, 136, 0.4); /* teal-900/40 */
          color: #2dd4bf; /* teal-400 */
        }
        .scoutx-score-badge {
          padding: 0.25rem 0.5rem;
          font-size: 12px;
          font-weight: 700;
          border-radius: 0.25rem;
          border: 1px solid rgba(163, 230, 53, 0.3);
          color: #a3e635;
        }
        .scoutx-rating-bar-container {
          width: 4rem;
          height: 0.375rem;
          background-color: #27272a;
          border-radius: 9999px;
          overflow: hidden;
        }
        .scoutx-rating-bar {
          height: 100%;
          border-radius: 9999px;
        }

        .scoutx-banner {
          background-color: #222222;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 0.75rem;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .scoutx-banner-title {
          font-size: 28px;
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.025em;
          margin: 0 0 0.5rem 0;
        }
        .scoutx-banner-desc {
          color: #71717a;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0;
        }
        .scoutx-banner-btn {
          width: 3.5rem;
          height: 3.5rem;
          background-color: #a3e635;
          border-radius: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
          box-shadow: 0 0 15px rgba(163, 230, 53, 0.3);
          color: #000000;
          text-decoration: none;
        }
        .scoutx-banner-btn:hover {
          background-color: #bef264;
        }
      `}</style>

      <div className="scoutx-dashboard-bg">
        <div className="scoutx-dashboard-inner">
          <h2 className="scoutx-dash-title">My Dashboard</h2>

          {/* Metrics Grid */}
          <div className="scoutx-metrics-grid">
            
            {/* Metric 1 */}
            <div className="scoutx-metric-card" style={{ borderLeftColor: "#a3e635" }}>
              <div style={{ color: "#a3e635" }} className="scoutx-metric-label">
                {isScout ? "TOTAL PLAYERS SCOUTED" : "TOTAL PLAYERS"}
              </div>
              <div className="scoutx-metric-value-row">
                <div style={{ color: "#a3e635" }} className="scoutx-metric-value">{totalPlayers}</div>
                <div className="scoutx-metric-desc">
                  {isScout ? "ACTIVE IN DATABASE" : "ACROSS NETWORK"}
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="scoutx-metric-card" style={{ borderLeftColor: "#a3e635" }}>
              <div style={{ color: "#a3e635" }} className="scoutx-metric-label">
                {isScout ? "MY EVALUATIONS" : "ACTIVE SCOUTS"}
              </div>
              <div className="scoutx-metric-value-row">
                <div style={{ color: "#a3e635" }} className="scoutx-metric-value">
                  {isScout ? totalEvaluations : totalScouts}
                </div>
                <div className="scoutx-metric-desc">
                  {isScout ? "ENTRIES IN TABLE" : "REGISTERED OPERATIVES"}
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="scoutx-metric-card" style={{ borderLeftColor: "#f97316" }}>
              <div style={{ color: "#f97316" }} className="scoutx-metric-label">
                {isScout ? "PENDING UPDATES" : "TOTAL EVALUATIONS"}
              </div>
              <div className="scoutx-metric-value-row">
                <div style={{ color: "#f97316" }} className="scoutx-metric-value">
                  {isScout ? "0" : totalEvaluations}
                </div>
                <div className="scoutx-metric-desc">
                  {isScout ? "NO OUTDATED PERFS" : "NETWORK-WIDE NOTES"}
                </div>
              </div>
            </div>

          </div>

          {/* Data Table Section */}
          <div className="scoutx-table-section">
            <div className="scoutx-table-header">
              <h3 className="scoutx-table-title">
                <div className="scoutx-table-dot"></div>
                {isScout ? "MY ADDED TALENT (RECENT)" : "RECENT NETWORK ACTIVITY"}
              </h3>
              {role !== "Manager" && (
                <Link href="/players/new" className="scoutx-table-btn">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
                  ADD NEW PLAYER
                </Link>
              )}
            </div>
            
            <div className="scoutx-table-wrapper">
              <table className="scoutx-table">
                <thead>
                  <tr>
                    <th>POS</th>
                    <th>PLAYER NAME</th>
                    {!isScout && <th>SCOUT</th>}
                    <th>MATCH DATE</th>
                    <th>RATING</th>
                    <th style={{ textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPerformances.length === 0 ? (
                    <tr>
                      <td colSpan={isScout ? 5 : 6} style={{ textAlign: "center", padding: "2rem" }}>
                        No recent activity found.
                      </td>
                    </tr>
                  ) : (
                    recentPerformances.map((perf) => {
                      const score = perf.CalculatedScore;
                      const scoreColor = SCORE_COLOR_HEX(score);
                      const barWidth = score ? Math.min(score, 100) : 0;
                      
                      return (
                        <tr key={perf.PerformanceID}>
                          <td>
                            <span className="scoutx-pos-badge">
                              {perf.Players?.Position || "UNK"}
                            </span>
                          </td>
                          <td>
                            <Link href={`/players/${perf.PlayerID}`} style={{ color: "#ffffff", fontWeight: 500, textDecoration: "none" }}>
                              {perf.Players?.Name}
                            </Link>
                          </td>
                          {!isScout && (
                            <td style={{ color: "#a1a1aa", fontSize: "12px" }}>
                              {perf.Users?.Name || "Unknown"}
                            </td>
                          )}
                          <td style={{ color: "#a1a1aa", fontSize: "12px" }}>
                            {perf.MatchDate.toLocaleDateString()}
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <div className="scoutx-rating-bar-container">
                                <div 
                                  className="scoutx-rating-bar" 
                                  style={{ width: `${barWidth}%`, backgroundColor: scoreColor }}
                                ></div>
                              </div>
                              <span style={{ color: scoreColor, fontWeight: 700, fontSize: "12px" }}>
                                {score ? score.toFixed(1) : "—"}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", color: "#71717a" }}>
                              <Link href={`/players/${perf.PlayerID}`} style={{ color: "inherit", transition: "color 0.2s" }}>
                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>visibility</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Banner */}
          <div className="scoutx-banner">
            <div>
              <h3 className="scoutx-banner-title">Access Full Database: {totalDbPlayers}+ Players Found</h3>
              <p className="scoutx-banner-desc">FILTER BY CONTRACT STATUS, AGE PROFILE, AND METRIC-WEIGHTED POTENTIAL SCORES</p>
            </div>
            <Link href="/search" className="scoutx-banner-btn">
              <span className="material-symbols-outlined">chevron_right</span>
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
