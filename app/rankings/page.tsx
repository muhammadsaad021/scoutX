"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { generateRankingsPDF } from "@/lib/pdf-generator";
import { useRankings } from "../../hooks/useRankings";
import { useToast } from "../../hooks/useToast";
import { exportRankingsAPI } from "../../services/rankingsService";
import { RankedPlayer } from "../../types/player";

const POSITIONS = ["", "Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker"];

const getScoreColor = (score: number) => {
  if (score >= 80) return "var(--color-primary)";
  if (score >= 60) return "var(--color-warning)";
  return "var(--color-danger)";
};

const ScoreBar = ({ score }: { score: number }) => {
  const color = getScoreColor(score);
  return (
    <div className="scoutx-score-bar-container">
      <div className="scoutx-score-bar-bg">
        <div className="scoutx-score-bar-fill" style={{ width: `${Math.min(score, 100)}%`, backgroundColor: color }} />
      </div>
      <span className="scoutx-score-val" style={{ color }}>{score.toFixed(1)}</span>
    </div>
  );
};

export default function RankingsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const [position, setPosition] = useState("");
  const { ranked, total, loading, message } = useRankings(position);
  
  const [exporting, setExporting] = useState(false);
  const { toast, showToast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportRankingsAPI(position);
      showToast("Rankings exported as CSV!");
    } catch (err: any) {
      showToast(err.message || "Export failed.", false);
    } finally {
      setExporting(false);
    }
  };


  return (
    <>
      <style>{`
        .scoutx-rankings-bg { background-color: var(--color-bg-body); min-height: 100vh; padding: var(--space-2xl); color: var(--color-text-primary); font-family: var(--font-body); }
        .scoutx-rankings-container { max-width: 1200px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 2.5rem; }

        .scoutx-rankings-header { display: flex; flex-direction: column; gap: 1.5rem; }
        @media(min-width: 768px) { .scoutx-rankings-header { flex-direction: row; justify-content: space-between; align-items: flex-end; } }
        .scoutx-rankings-title { font-family: var(--font-heading); font-size: 2.5rem; font-weight: var(--fw-extrabold); color: var(--color-text-primary); margin: 0 0 0.5rem 0; letter-spacing: var(--ls-tight); line-height: 1; }
        .scoutx-rankings-subtitle { color: var(--color-text-muted); font-size: var(--text-sm); font-weight: var(--fw-semibold); text-transform: uppercase; letter-spacing: var(--ls-wider); margin: 0; }

        .scoutx-rankings-actions { display: flex; gap: 0.75rem; }
        .scoutx-rankings-btn { background-color: #111; border: 1px solid #333; color: #888; padding: 0.75rem 1.25rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; transition: all 0.2s; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; }
        .scoutx-rankings-btn:hover:not(:disabled) { background-color: #222; color: #fff; border-color: #555; }
        .scoutx-rankings-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .scoutx-rankings-btn-primary { background-color: rgba(93, 255, 49, 0.1); color: #5DFF31; border-color: rgba(93, 255, 49, 0.3); }
        .scoutx-rankings-btn-primary:hover:not(:disabled) { background-color: rgba(93, 255, 49, 0.2); color: #7aff54; border-color: #5DFF31; }

        .scoutx-rankings-filters { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .scoutx-rankings-chip { padding: 0.5rem 1.25rem; border-radius: var(--radius-full); font-size: 0.6875rem; font-weight: var(--fw-semibold); letter-spacing: 0.05em; text-transform: uppercase; background-color: var(--color-bg-card); color: var(--color-text-muted); border: 1px solid var(--color-border); transition: all var(--transition-normal); cursor: pointer; font-family: var(--font-body); }
        .scoutx-rankings-chip:hover { background-color: #222; color: #fff; }
        .scoutx-rankings-chip.active { background-color: var(--color-primary); color: var(--color-on-primary); border-color: var(--color-primary); box-shadow: 0 0 10px rgba(93,255,49,0.2); }

        .scoutx-rankings-podium { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media(min-width: 768px) { .scoutx-rankings-podium { grid-template-columns: repeat(3, 1fr); } }
        
        .scoutx-podium-card { background-color: #111; border: 1px solid #222; border-radius: 0.75rem; padding: 1.5rem; position: relative; overflow: hidden; transition: all 0.2s; text-decoration: none; display: block; }
        .scoutx-podium-card:hover { border-color: rgba(93, 255, 49, 0.3); background-color: #151515; transform: translateY(-2px); }
        .scoutx-podium-card.rank-1 { border-color: rgba(255, 215, 0, 0.3); background-color: rgba(255, 215, 0, 0.02); }
        .scoutx-podium-card.rank-2 { border-color: rgba(192, 192, 192, 0.3); background-color: rgba(192, 192, 192, 0.02); }
        .scoutx-podium-card.rank-3 { border-color: rgba(205, 127, 50, 0.3); background-color: rgba(205, 127, 50, 0.02); }

        .scoutx-podium-rank { position: absolute; right: 1rem; top: 1rem; opacity: 0.05; font-size: 5rem; font-weight: var(--fw-black); line-height: 0.8; font-family: var(--font-heading); transition: opacity var(--transition-normal); }
        .scoutx-podium-card:hover .scoutx-podium-rank { opacity: 0.1; }
        .scoutx-podium-card.rank-1 .scoutx-podium-rank { color: #FFD700; opacity: 0.1; }
        .scoutx-podium-card.rank-2 .scoutx-podium-rank { color: #C0C0C0; opacity: 0.1; }
        .scoutx-podium-card.rank-3 .scoutx-podium-rank { color: #CD7F32; opacity: 0.1; }

        .scoutx-podium-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2.5rem; }
        .scoutx-podium-dot { width: 6px; height: 6px; border-radius: 50%; }
        .scoutx-podium-card.rank-1 .scoutx-podium-dot { background-color: #FFD700; box-shadow: 0 0 8px #FFD700; }
        .scoutx-podium-card.rank-2 .scoutx-podium-dot { background-color: #C0C0C0; box-shadow: 0 0 8px #C0C0C0; }
        .scoutx-podium-card.rank-3 .scoutx-podium-dot { background-color: #CD7F32; box-shadow: 0 0 8px #CD7F32; }
        .scoutx-podium-title { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; }
        .scoutx-podium-card.rank-1 .scoutx-podium-title { color: #FFD700; }
        .scoutx-podium-card.rank-2 .scoutx-podium-title { color: #C0C0C0; }
        .scoutx-podium-card.rank-3 .scoutx-podium-title { color: #CD7F32; }

        .scoutx-podium-player { display: flex; justify-content: space-between; align-items: flex-end; position: relative; z-index: 2; }
        .scoutx-podium-name { font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: var(--fw-bold); color: var(--color-text-primary); margin: 0 0 0.25rem 0; line-height: var(--lh-snug); }
        .scoutx-podium-meta { font-size: 0.6875rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }

        .scoutx-podium-score { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 0.25rem; background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
        .scoutx-podium-card.rank-1 .scoutx-podium-score { background-color: rgba(255, 215, 0, 0.1); border-color: rgba(255, 215, 0, 0.3); color: #FFD700; }
        .scoutx-podium-card.rank-2 .scoutx-podium-score { background-color: rgba(192, 192, 192, 0.1); border-color: rgba(192, 192, 192, 0.3); color: #C0C0C0; }
        .scoutx-podium-card.rank-3 .scoutx-podium-score { background-color: rgba(205, 127, 50, 0.1); border-color: rgba(205, 127, 50, 0.3); color: #CD7F32; }

        .scoutx-podium-score-val { font-size: var(--text-lg); font-weight: var(--fw-bold); line-height: 1; margin-bottom: 2px; font-family: var(--font-heading); }
        .scoutx-podium-score-lbl { font-size: 0.45rem; font-weight: 700; line-height: 1; letter-spacing: 0.1em; }

        .scoutx-table-container { background-color: #111; border: 1px solid #222; border-radius: 0.75rem; overflow: hidden; }
        .scoutx-table { width: 100%; border-collapse: collapse; text-align: left; }
        .scoutx-th { padding: 1.25rem 1.5rem; font-size: 0.6875rem; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #222; }
        .scoutx-td { padding: 1.25rem 1.5rem; font-size: 0.875rem; color: #ccc; border-bottom: 1px solid #222; }
        .scoutx-tr:last-child .scoutx-td { border-bottom: none; }
        .scoutx-tr:hover { background-color: #151515; }

        .scoutx-rank-badge { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 4px; font-weight: 700; font-size: 0.75rem; background: #222; color: #888; }
        .scoutx-rank-badge.rank-1 { background: rgba(255, 215, 0, 0.15); color: #FFD700; box-shadow: 0 0 10px rgba(255,215,0,0.1); }
        .scoutx-rank-badge.rank-2 { background: rgba(192, 192, 192, 0.15); color: #C0C0C0; box-shadow: 0 0 10px rgba(192,192,192,0.1); }
        .scoutx-rank-badge.rank-3 { background: rgba(205, 127, 50, 0.15); color: #CD7F32; box-shadow: 0 0 10px rgba(205,127,50,0.1); }

        .scoutx-player-link { font-family: var(--font-heading); font-weight: var(--fw-bold); color: var(--color-text-primary); text-decoration: none; font-size: var(--text-md); }
        .scoutx-player-link:hover { text-decoration: underline; color: var(--color-primary); }
        .scoutx-pos-badge { background-color: var(--color-primary-muted); color: var(--color-primary); padding: 2px 8px; border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: var(--fw-bold); text-transform: uppercase; letter-spacing: 0.05em; }

        .scoutx-toast {
          position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999;
          padding: 0.875rem 1.25rem; border-radius: 0.5rem;
          color: var(--color-on-primary); font-weight: var(--fw-semibold); box-shadow: var(--shadow-lg);
          font-family: var(--font-body); display: flex; align-items: center; gap: var(--space-sm);
        }
      `}</style>

      <div className="scoutx-rankings-bg">
        <div className="scoutx-rankings-container">

          {/* Toast */}
          {toast.show && (
            <div className="scoutx-toast" style={{ background: toast.ok ? "#5DFF31" : "#ef4444", color: toast.ok ? "#000" : "#fff" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{toast.ok ? "check_circle" : "error"}</span>
              {toast.message}
            </div>
          )}

          {/* Page Header */}
          <header className="scoutx-rankings-header">
            <div>
              <h1 className="scoutx-rankings-title">ScoutX Intel Rankings</h1>
              <p className="scoutx-rankings-subtitle">
                {loading ? "Analyzing Database..." : message || `${total} player${total !== 1 ? "s" : ""} evaluated${position ? ` — ${position}` : ""}`}
              </p>
            </div>
            <div className="scoutx-rankings-actions">
              <button
                className="scoutx-rankings-btn"
                onClick={() => {
                  generateRankingsPDF(ranked, position);
                  showToast("Rankings exported as PDF!");
                }}
                disabled={ranked.length === 0}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>picture_as_pdf</span>
                Export PDF
              </button>
              <button
                className="scoutx-rankings-btn scoutx-rankings-btn-primary"
                onClick={handleExport}
                disabled={exporting || ranked.length === 0}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>download</span>
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>
          </header>

          {/* Position Filters */}
          <div className="scoutx-rankings-filters">
            {POSITIONS.map((pos) => (
              <button
                key={pos || "all"}
                onClick={() => setPosition(pos)}
                className={`scoutx-rankings-chip ${position === pos ? "active" : ""}`}
              >
                {pos ? pos.toUpperCase() + "S" : "ALL POSITIONS"}
              </button>
            ))}
          </div>

          {/* Top 3 Podium (ScoutX Intel Style) */}
          {!loading && ranked.length >= 3 && (
            <div className="scoutx-rankings-podium">
              {[
                { player: ranked[1], rank: 2, label: "SILVER", cls: "rank-2" },
                { player: ranked[0], rank: 1, label: "GOLD", cls: "rank-1" },
                { player: ranked[2], rank: 3, label: "BRONZE", cls: "rank-3" }
              ].map(({ player, rank, label, cls }) => {
                if (!player) return null;
                return (
                  <Link key={player.PlayerID} href={`/players/${player.PlayerID}`} className={`scoutx-podium-card ${cls}`}>
                    <div className="scoutx-podium-rank">{rank}</div>
                    <div className="scoutx-podium-header">
                      <div className="scoutx-podium-dot"></div>
                      <div className="scoutx-podium-title">RANK {rank} • {label}</div>
                    </div>
                    <div className="scoutx-podium-player">
                      <div>
                        <h3 className="scoutx-podium-name">{player.Name}</h3>
                        <p className="scoutx-podium-meta">{player.Position} • {player.Club ?? "—"}</p>
                      </div>
                      <div className="scoutx-podium-score">
                        <span className="scoutx-podium-score-val">{player.AverageScore.toFixed(0)}</span>
                        <span className="scoutx-podium-score-lbl">OVR</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="scoutx-table-container">
            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#666", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "32px", animation: "spin 2s linear infinite" }}>sync</span>
                <span style={{ fontSize: "0.875rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Calculating Tactical Rankings...</span>
              </div>
            ) : ranked.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#666" }}>
                <p style={{ margin: "0 0 1rem 0" }}>{message || "No players with performance data found."}</p>
                {(userRole === "Scout" || userRole === "Admin") && (
                  <Link href="/players" style={{ color: "#5DFF31", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
                    ADD PERFORMANCE DATA →
                  </Link>
                )}
              </div>
            ) : (
              <table className="scoutx-table">
                <thead>
                  <tr>
                    <th className="scoutx-th" style={{ width: "80px", textAlign: "center" }}>Rank</th>
                    <th className="scoutx-th">Player Identity</th>
                    <th className="scoutx-th">Position</th>
                    <th className="scoutx-th">Club</th>
                    <th className="scoutx-th text-center">Age</th>
                    <th className="scoutx-th text-center">Evals</th>
                    <th className="scoutx-th" style={{ width: "25%" }}>Overall Score</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((player) => (
                    <tr key={player.PlayerID} className="scoutx-tr">
                      <td className="scoutx-td" style={{ textAlign: "center" }}>
                        <div className={`scoutx-rank-badge ${player.Rank <= 3 ? `rank-${player.Rank}` : ""}`}>
                          {player.Rank}
                        </div>
                      </td>
                      <td className="scoutx-td">
                        <Link href={`/players/${player.PlayerID}`} className="scoutx-player-link">
                          {player.Name}
                        </Link>
                      </td>
                      <td className="scoutx-td">
                        <span className="scoutx-pos-badge">{player.Position}</span>
                      </td>
                      <td className="scoutx-td">{player.Club ?? "—"}</td>
                      <td className="scoutx-td text-center">{player.Age ?? "—"}</td>
                      <td className="scoutx-td text-center" style={{ color: "#888" }}>{player.MatchesPlayed}</td>
                      <td className="scoutx-td">
                        <ScoreBar score={player.AverageScore} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
