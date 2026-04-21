"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type RankedPlayer = {
  Rank: number;
  PlayerID: number;
  Name: string;
  Position: string;
  Club: string | null;
  Age: number | null;
  MatchesPlayed: number;
  AverageScore: number;
};

const POSITIONS = ["", "Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker"];

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const SCORE_COLOR = (score: number) => {
  if (score >= 60) return "var(--success)";
  if (score >= 30) return "var(--warning)";
  return "var(--danger)";
};

const ScoreBar = ({ score }: { score: number }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "0.5rem",
  }}>
    <div style={{
      flex: 1, height: "6px", borderRadius: "3px",
      background: "var(--bg-tertiary)", overflow: "hidden",
    }}>
      <div style={{
        height: "100%", borderRadius: "3px",
        width: `${Math.min(score, 100)}%`,
        background: SCORE_COLOR(score),
        transition: "width 0.6s ease",
      }} />
    </div>
    <span style={{
      minWidth: "2.5rem", textAlign: "right", fontWeight: 700,
      color: SCORE_COLOR(score), fontSize: "0.875rem",
    }}>
      {score}
    </span>
  </div>
);

export default function RankingsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const [ranked, setRanked] = useState<RankedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState("");
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", ok: true });

  const showToast = (msg: string, ok = true) => {
    setToast({ show: true, message: msg, ok });
    setTimeout(() => setToast({ show: false, message: "", ok: true }), 3000);
  };

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setMessage("");
    const params = new URLSearchParams();
    if (position) params.set("position", position);

    const res = await fetch(`/api/rankings?${params}`);
    const data = await res.json();

    if (res.ok) {
      setRanked(data.ranked);
      setTotal(data.total);
      if (data.message) setMessage(data.message);
    }
    setLoading(false);
  }, [position]);

  useEffect(() => { fetchRankings(); }, [fetchRankings]);

  const handleExport = async () => {
    setExporting(true);
    const params = new URLSearchParams();
    if (position) params.set("position", position);
    const res = await fetch(`/api/rankings/export?${params}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.split('filename="')[1]?.replace('"', '') ?? "rankings.csv";
      a.click();
      URL.revokeObjectURL(url);
      showToast("Rankings exported as CSV!");
    } else {
      showToast("Export failed.", false);
    }
    setExporting(false);
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

      {/* Toast */}
      {toast.show && (
        <div style={{
          position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999,
          padding: "0.875rem 1.25rem", borderRadius: "var(--radius-md)",
          background: toast.ok ? "var(--success)" : "var(--danger)",
          color: "white", fontWeight: 600, boxShadow: "var(--shadow-lg)",
        }}>
          {toast.ok ? "✓" : "✗"} {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Player Rankings</h1>
          <p>
            {loading ? "Calculating..." : message || `${total} player${total !== 1 ? "s" : ""} ranked${position ? ` — ${position}` : " across all positions"}`}
          </p>
        </div>
        <button
          id="btn-export-rankings"
          className="btn btn-secondary"
          onClick={handleExport}
          disabled={exporting || ranked.length === 0}
        >
          {exporting ? "Exporting..." : "⬇ Export CSV"}
        </button>
      </div>

      {/* Position Filter */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {POSITIONS.map((pos) => (
          <button
            key={pos || "all"}
            id={`filter-${pos || "all"}`}
            onClick={() => setPosition(pos)}
            className="btn"
            style={{
              padding: "0.4rem 1rem",
              fontSize: "0.8rem",
              background: position === pos ? "var(--primary)" : "var(--bg-secondary)",
              color: position === pos ? "white" : "var(--text-secondary)",
              border: `1px solid ${position === pos ? "var(--primary)" : "var(--border-color)"}`,
              borderRadius: "var(--radius-full)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {pos || "All Positions"}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {!loading && ranked.length >= 3 && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1rem", marginBottom: "2rem",
        }}>
          {[ranked[1], ranked[0], ranked[2]].map((player, i) => {
            if (!player) return null;
            const podiumOrder = [2, 1, 3];
            const heights = ["120px", "150px", "100px"];
            return (
              <Link
                key={player.PlayerID}
                href={`/players/${player.PlayerID}`}
                style={{ textDecoration: "none" }}
              >
                <div className="card animate-fade-in" style={{
                  textAlign: "center", padding: "1.5rem 1rem",
                  borderTop: `3px solid ${i === 1 ? "var(--primary)" : i === 0 ? "#9CA3AF" : "#CD7F32"}`,
                  transition: "transform 0.2s ease",
                  cursor: "pointer",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{MEDAL[podiumOrder[i]]}</div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                    {player.Name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                    {player.Position} · {player.Club ?? "—"}
                  </div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: SCORE_COLOR(player.AverageScore) }}>
                    {player.AverageScore}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    avg score
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            Calculating rankings...
          </div>
        ) : ranked.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            {message || "No players with performance data found."}
            {(userRole === "Scout" || userRole === "Admin") && (
              <p style={{ marginTop: "0.75rem" }}>
                <Link href="/players" style={{ color: "var(--primary)" }}>
                  Add performance data to players →
                </Link>
              </p>
            )}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Rank</th>
                <th>Player</th>
                <th>Position</th>
                <th>Club</th>
                <th>Age</th>
                <th>Matches</th>
                <th style={{ minWidth: "180px" }}>Average Score</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((player) => (
                <tr key={player.PlayerID} className="animate-fade-in">
                  <td>
                    <span style={{
                      fontWeight: 700, fontSize: "1rem",
                      color: player.Rank <= 3 ? "var(--primary)" : "var(--text-muted)",
                    }}>
                      {MEDAL[player.Rank] || `#${player.Rank}`}
                    </span>
                  </td>
                  <td>
                    <Link href={`/players/${player.PlayerID}`}
                      style={{ fontWeight: 600, color: "var(--text-primary)", textDecoration: "none" }}
                      id={`btn-rank-player-${player.PlayerID}`}
                    >
                      {player.Name}
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-primary">{player.Position}</span>
                  </td>
                  <td>{player.Club ?? "—"}</td>
                  <td>{player.Age ?? "—"}</td>
                  <td style={{ color: "var(--text-muted)" }}>{player.MatchesPlayed}</td>
                  <td style={{ minWidth: "180px" }}>
                    <ScoreBar score={player.AverageScore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
