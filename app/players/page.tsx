"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Player = {
  PlayerID: number;
  Name: string;
  Age: number | null;
  Position: string;
  Club: string | null;
  Height: number | null;
  Weight: number | null;
  CreatedAt: string;
  AverageScore: number | null;
  MatchesPlayed: number;
  Users: { Name: string } | null;
};

const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker"];

export default function PlayersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userRole = (session?.user as any)?.role;

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("ALL PLAYERS");
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);
  const [toast, setToast] = useState({ show: false, message: "", ok: true });

  const showToast = (message: string, ok = true) => {
    setToast({ show: true, message, ok });
    setTimeout(() => setToast({ show: false, message: "", ok: true }), 3000);
  };

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (position && position !== "ALL PLAYERS") params.set("position", position);
    const res = await fetch(`/api/players?${params.toString()}`);
    if (res.ok) setPlayers(await res.json());
    setLoading(false);
  }, [search, position]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchPlayers(), 300);
    return () => clearTimeout(debounce);
  }, [fetchPlayers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/players/${deleteTarget.PlayerID}`, { method: "DELETE" });
    setDeleteTarget(null);
    if (res.ok) {
      showToast("Player deleted.");
      fetchPlayers();
    } else {
      showToast("Failed to delete player.", false);
    }
  };

  const activeCount = players.length;

  return (
    <>
      <style>{`
        .scoutx-pool-bg { background-color: var(--color-bg-elevated); min-height: 100vh; padding: var(--space-2xl); width: 100%; }
        .scoutx-pool-container { max-width: 1000px; margin: 0 auto; }
        .scoutx-pool-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
        .scoutx-pool-title { font-family: var(--font-heading); font-size: 2.25rem; font-weight: var(--fw-bold); color: var(--color-text-primary); margin: 0 0 0.5rem 0; }
        .scoutx-pool-subtitle { color: var(--color-text-muted); font-size: var(--text-sm); font-weight: var(--fw-semibold); text-transform: uppercase; letter-spacing: 0.05em; margin: 0; font-family: var(--font-body); }
        
        .scoutx-pool-sort-btn {
          background-color: #222222; color: #888888; font-size: 0.75rem; font-weight: 600; padding: 0.625rem 1rem;
          border-radius: 0.25rem; display: flex; align-items: center; gap: 0.5rem; border: none; cursor: pointer; transition: background-color 0.2s;
        }
        .scoutx-pool-sort-btn:hover { background-color: #2a2a2a; }

        .scoutx-pool-search-container { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .scoutx-pool-search-box {
          flex: 1; background-color: #111111; border: 1px solid #222222; border-radius: 4px;
          display: flex; align-items: center; padding: 0.75rem 1rem;
        }
        .scoutx-pool-search-input { background: transparent; border: none; outline: none; width: 100%; color: var(--color-text-primary); font-family: var(--font-body); font-size: var(--text-base); }
        .scoutx-pool-search-input::placeholder { color: #555555; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
        
        .scoutx-pool-filter-btn {
          background-color: #222222; border: 1px solid #333333; color: #888888; padding: 0.75rem 1.5rem;
          border-radius: 0.25rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem;
          font-weight: 600; letter-spacing: 0.05em; transition: background-color 0.2s; cursor: pointer;
        }
        .scoutx-pool-filter-btn:hover { background-color: #2a2a2a; }

        .scoutx-pool-filters { display: flex; gap: 0.75rem; margin-bottom: 2.5rem; flex-wrap: wrap; }
        .scoutx-pool-chip {
          padding: 0.5rem 1.5rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase; background-color: #222222; color: #888888;
          transition: all var(--transition-normal); border: none; cursor: pointer; font-family: var(--font-body);
        }
        .scoutx-pool-chip:hover { background-color: #2a2a2a; color: #ffffff; }
        .scoutx-pool-chip.active { background-color: #5DFF31; color: #000000; }
        
        .scoutx-pool-list { display: flex; flex-direction: column; gap: 1rem; }
        .scoutx-pool-card {
          background-color: #111111; border: 1px solid #222222; border-radius: 8px;
          padding: 1rem 1.5rem; display: flex; align-items: center; gap: 1.5rem;
          transition: all 0.2s; text-decoration: none; position: relative;
        }
        .scoutx-pool-card:hover { background-color: #151515; border-color: #333333; }
        .scoutx-pool-avatar { width: 60px; height: 60px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--color-on-primary); background-color: var(--color-primary); font-family: var(--font-heading); font-weight: var(--fw-extrabold); }
        
        .scoutx-pool-info { flex: 1; }
        .scoutx-pool-name-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem; }
        .scoutx-pool-name { font-family: var(--font-heading); font-weight: var(--fw-bold); font-size: var(--text-xl); color: var(--color-text-primary); margin: 0; text-decoration: none; }
        .scoutx-pool-name:hover { text-decoration: underline; }
        .scoutx-pool-tag { background-color: var(--color-primary-muted); color: var(--color-primary); padding: 2px 8px; border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: var(--fw-semibold); letter-spacing: 0.05em; font-family: var(--font-body); }
        .scoutx-pool-meta { color: var(--color-text-muted); font-size: var(--text-sm); margin: 0; font-family: var(--font-body); }
        
        .scoutx-pool-stats { display: flex; align-items: center; gap: 3rem; text-align: right; }
        .scoutx-pool-stat-value { font-family: var(--font-heading); font-weight: var(--fw-bold); font-size: 1.875rem; color: var(--color-text-primary); line-height: 1; margin-bottom: 0.125rem; }
        .scoutx-pool-stat-value.muted { color: var(--color-text-muted); }
        .scoutx-pool-stat-label { color: var(--color-text-dim); font-size: 9px; font-weight: var(--fw-bold); text-transform: uppercase; letter-spacing: var(--ls-wider); font-family: var(--font-body); }
        .scoutx-pool-divider { width: 1px; height: 40px; background-color: #222222; }

        .scoutx-pool-actions { position: absolute; right: 1.5rem; top: 1.5rem; display: flex; gap: 0.5rem; opacity: 0; transition: opacity 0.2s; }
        .scoutx-pool-card:hover .scoutx-pool-actions { opacity: 1; }
        .scoutx-pool-action-btn { background: none; border: none; color: #888888; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0.25rem; border-radius: 4px; }
        .scoutx-pool-action-btn:hover { background: #222222; color: #ffffff; }
        .scoutx-pool-action-btn.delete:hover { color: #ef4444; }

        .scoutx-toast {
          position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999;
          padding: 0.875rem 1.25rem; border-radius: 0.5rem;
          color: white; font-weight: 600; box-shadow: 0 10px 25px -3px rgba(0,0,0,0.5);
          font-family: var(--font-body);
        }

        .scoutx-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .scoutx-modal {
          background: #111; border: 1px solid #222; border-radius: 8px;
          padding: 2rem; width: 100%; max-width: 400px; text-align: center;
        }
        .scoutx-modal h3 { font-family: var(--font-heading); font-weight: var(--fw-bold); font-size: var(--text-2xl); color: var(--color-text-primary); margin: 0 0 var(--space-md) 0; }
        .scoutx-modal p { color: #888; margin: 0 0 2rem 0; font-size: 0.875rem; }
        .scoutx-modal-btns { display: flex; gap: 1rem; }
        .scoutx-modal-btn { flex: 1; padding: 0.75rem; border-radius: 4px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }
        .scoutx-modal-btn-danger { background: #ef4444; color: #fff; }
        .scoutx-modal-btn-danger:hover { background: #dc2626; }
        .scoutx-modal-btn-cancel { background: #222; color: #fff; }
        .scoutx-modal-btn-cancel:hover { background: #333; }
      `}</style>
      
      <div className="scoutx-pool-bg">
        <div className="scoutx-pool-container">

          {/* Toast */}
          {toast.show && (
            <div className="scoutx-toast" style={{ background: toast.ok ? "#5DFF31" : "#ef4444", color: toast.ok ? "#000" : "#fff" }}>
              {toast.ok ? "✓" : "✗"} {toast.message}
            </div>
          )}

          {/* Header */}
          <header className="scoutx-pool-header">
            <div>
              <h1 className="scoutx-pool-title">Verified Talent Pool</h1>
              <p className="scoutx-pool-subtitle">{activeCount} Active Profile{activeCount !== 1 ? 's' : ''} Identified</p>
            </div>
            {(userRole === "Scout" || userRole === "Admin") && (
              <Link href="/players/new" style={{ textDecoration: 'none' }}>
                <button className="scoutx-pool-sort-btn" style={{ backgroundColor: "#5DFF31", color: "#000" }}>
                  + ADD NEW PLAYER
                </button>
              </Link>
            )}
          </header>

          {/* Search Bar */}
          <div className="scoutx-pool-search-container">
            <div className="scoutx-pool-search-box">
              <span className="material-symbols-outlined" style={{ color: "#555", marginRight: "12px" }}>search</span>
              <input 
                className="scoutx-pool-search-input" 
                placeholder="SEARCH BY NAME, CLUB, OR POSITION..." 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link href="/search" style={{ textDecoration: "none" }}>
              <button className="scoutx-pool-filter-btn">
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>manage_search</span>
                ADVANCED SEARCH
              </button>
            </Link>
          </div>

          {/* Filters */}
          <div className="scoutx-pool-filters">
            {["ALL PLAYERS", ...POSITIONS].filter(Boolean).map(pos => (
              <button 
                key={pos} 
                className={`scoutx-pool-chip ${position === pos ? 'active' : ''}`}
                onClick={() => setPosition(pos)}
              >
                {pos === "ALL PLAYERS" ? pos : pos.toUpperCase() + "S"}
              </button>
            ))}
          </div>

          {/* Player List */}
          <div className="scoutx-pool-list">
            {loading ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#888" }}>Loading profiles...</div>
            ) : players.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#888" }}>
                No active profiles found matching criteria.
              </div>
            ) : (
              players.map(player => {
                const score = player.AverageScore;
                const isElite = score && score >= 85;
                const scoreDisplay = score ? score.toFixed(1) : "—";
                
                return (
                  <div key={player.PlayerID} className="scoutx-pool-card">
                    <div className="scoutx-pool-avatar">
                      {player.Name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="scoutx-pool-info">
                      <div className="scoutx-pool-name-row">
                        <Link href={`/players/${player.PlayerID}`} className="scoutx-pool-name">
                          {player.Name}
                        </Link>
                        {isElite && <span className="scoutx-pool-tag">ELITE_PROSPECT</span>}
                      </div>
                      <p className="scoutx-pool-meta">
                        {player.Club || "Unknown Club"} • {player.Position || "UNK"} • {player.Age ? `${player.Age} Years Old` : "Age Unknown"}
                      </p>
                    </div>

                    <div className="scoutx-pool-stats">
                      <div>
                        <div className={`scoutx-pool-stat-value ${!score ? 'muted' : ''}`}>{scoreDisplay}</div>
                        <div className="scoutx-pool-stat-label">OVR SCORE</div>
                      </div>
                      <div className="scoutx-pool-divider"></div>
                      <div style={{ width: "80px" }}>
                        <div className="scoutx-pool-stat-value" style={{ fontSize: "1.25rem", marginTop: "0.5rem" }}>
                          {player.MatchesPlayed}
                        </div>
                        <div className="scoutx-pool-stat-label">EVALS</div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="scoutx-pool-actions">
                      {(userRole === "Scout" || userRole === "Admin") && (
                        <Link href={`/players/${player.PlayerID}/edit`} className="scoutx-pool-action-btn" title="Edit Player">
                          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit</span>
                        </Link>
                      )}
                      {userRole === "Admin" && (
                        <button className="scoutx-pool-action-btn delete" onClick={() => setDeleteTarget(player)} title="Delete Player">
                          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="scoutx-modal-overlay">
          <div className="scoutx-modal">
            <h3>Terminate Profile?</h3>
            <p>
              Are you sure you want to permanently delete <strong style={{ color: "#fff" }}>{deleteTarget.Name}</strong>? This action will purge all associated scouting data.
            </p>
            <div className="scoutx-modal-btns">
              <button className="scoutx-modal-btn scoutx-modal-btn-danger" onClick={handleDelete}>Confirm Purge</button>
              <button className="scoutx-modal-btn scoutx-modal-btn-cancel" onClick={() => setDeleteTarget(null)}>Abort</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
