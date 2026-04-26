"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type WatchlistPlayer = {
  PlayerID: number;
  Name: string;
  Position: string;
  Club: string | null;
  Age: number | null;
  Height: number | null;
  Weight: number | null;
  AverageScore: number | null;
  AddedAt: string;
};

type SearchResult = { PlayerID: number; Name: string; Position: string; Club: string | null };

type Watchlist = {
  WatchListID: number;
  ListName: string;
  CreatedAt: string;
  OwnerName: string | null;
  Players: WatchlistPlayer[];
};

const SCORE_COLOR = (score: number | null) => {
  if (!score) return "var(--color-text-muted)";
  if (score >= 60) return "var(--success)";
  if (score >= 30) return "var(--warning)";
  return "var(--danger)";
};

const POSITION_BADGE: Record<string, string> = {
  Goalkeeper: "badge-warning",
  Defender: "badge-primary",
  Midfielder: "badge-success",
  Forward: "badge-danger",
  Winger: "badge-danger",
  Striker: "badge-danger",
};

export default function WatchlistDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const canManage = userRole === "Coach" || userRole === "Manager" || userRole === "Admin";

  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", ok: true });

  // Add player state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);

  // Remove player
  const [removeTarget, setRemoveTarget] = useState<WatchlistPlayer | null>(null);

  const showToast = (message: string, ok = true) => {
    setToast({ show: true, message, ok });
    setTimeout(() => setToast({ show: false, message: "", ok: true }), 3000);
  };

  const fetchWatchlist = useCallback(async () => {
    const res = await fetch(`/api/watchlists/${id}`);
    if (res.status === 404) { setNotFound(true); setLoading(false); return; }
    if (res.ok) { setWatchlist(await res.json()); }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchWatchlist(); }, [fetchWatchlist]);

  // Live player search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/players?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const all = await res.json();
        const currentIds = watchlist?.Players.map((p) => p.PlayerID) ?? [];
        setSearchResults(all.filter((p: any) => !currentIds.includes(p.PlayerID)).slice(0, 5));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, watchlist]);

  const handleAddPlayer = async (player: SearchResult) => {
    setAddingId(player.PlayerID);
    setSearchQuery("");
    setSearchResults([]);
    const res = await fetch(`/api/watchlists/${id}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerID: player.PlayerID }),
    });
    const data = await res.json();
    if (res.ok) { showToast(data.message); fetchWatchlist(); }
    else showToast(data.error || "Failed to add player.", false);
    setAddingId(null);
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    const res = await fetch(`/api/watchlists/${id}/players/${removeTarget.PlayerID}`, {
      method: "DELETE",
    });
    setRemoveTarget(null);
    if (res.ok) { showToast("Player removed."); fetchWatchlist(); }
    else showToast("Failed to remove player.", false);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <p style={{ color: "var(--color-text-muted)" }}>Loading watchlist...</p>
    </div>
  );

  if (notFound || !watchlist) return (
    <div className="container" style={{ paddingTop: "2rem" }}>
      <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Watchlist Not Found</h2>
        <Link href="/watchlists" className="btn btn-primary">Back to Watchlists</Link>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .scoutx-wld-bg { background-color: #000000; min-height: 100vh; padding: 2.5rem; width: 100%; color: #FFFFFF; font-family: 'Inter', sans-serif; }
        .scoutx-wld-container { max-width: 1200px; margin: 0 auto; }
        
        .scoutx-wld-top-nav { margin-bottom: 1rem; }
        .scoutx-wld-back-link { color: #a1a1aa; font-family: 'Space Grotesk', sans-serif; font-size: 10px; text-transform: uppercase; text-decoration: none; letter-spacing: 0.1em; transition: color 0.2s; }
        .scoutx-wld-back-link:hover { color: #5DFF31; }

        .scoutx-wld-header { margin-bottom: 3rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; }
        .scoutx-wld-title-group {}
        .scoutx-wld-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 3rem; font-weight: 900; color: #5DFF31; margin: 0 0 0.5rem 0; line-height: 1.1; letter-spacing: -0.02em; text-transform: uppercase; text-shadow: 0 0 15px rgba(93, 255, 49, 0.3); }
        .scoutx-wld-subtitle { font-family: 'Space Grotesk', sans-serif; font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.15em; margin: 0; }

        .scoutx-wld-btn-compare { background-color: #5DFF31; color: #000000; font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 600; padding: 0.75rem 1.5rem; text-transform: uppercase; letter-spacing: 0.15em; border: none; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; }
        .scoutx-wld-btn-compare:hover { box-shadow: 0 0 20px rgba(93, 255, 49, 0.4); }

        .scoutx-wld-search-container { position: relative; margin-bottom: 3rem; }
        .scoutx-wld-search-title { font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 1rem; }
        .scoutx-wld-search-input { width: 100%; background: rgba(39, 39, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 1rem 1.5rem; border-radius: 0.5rem; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.3s; }
        .scoutx-wld-search-input:focus { border-color: #5DFF31; }
        .scoutx-wld-search-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 50; background: #18181b; border: 1px solid #3f3f46; border-radius: 0.5rem; overflow: hidden; }
        .scoutx-wld-search-item { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: none; border: none; border-bottom: 1px solid #27272a; cursor: pointer; color: #fff; text-align: left; transition: background 0.15s; }
        .scoutx-wld-search-item:hover { background: #27272a; }

        /* Card styles */
        .scoutx-wld-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 1.5rem; }
        @media (min-width: 768px) { .scoutx-wld-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .scoutx-wld-grid { grid-template-columns: repeat(3, 1fr); } }

        .scoutx-wld-card { background-color: rgba(42, 42, 42, 0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.75rem; overflow: hidden; position: relative; transition: all 0.3s; display: flex; flex-direction: column; }
        .scoutx-wld-card:hover { border-color: rgba(93, 255, 49, 0.5); }
        .scoutx-wld-card-content { padding: 1.5rem; position: relative; z-index: 10; flex-grow: 1; }

        .scoutx-wld-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .scoutx-wld-card-name { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.5rem; font-weight: 700; color: #ffffff; text-transform: uppercase; margin: 0; line-height: 1.2; transition: color 0.3s; text-decoration: none; }
        .scoutx-wld-card:hover .scoutx-wld-card-name { color: #5DFF31; }
        .scoutx-wld-score-badge { background-color: #131313; border: 1px solid #5DFF31; color: #5DFF31; font-weight: 700; font-size: 1.25rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; box-shadow: 0 0 10px rgba(93, 255, 49, 0.2); }

        .scoutx-wld-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
        .scoutx-wld-tag { padding: 0.25rem 0.75rem; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.2); font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; color: #d4d4d8; text-transform: uppercase; }

        .scoutx-wld-stats { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 0.5rem; }
        .scoutx-wld-stat-header { display: flex; justify-content: space-between; font-family: 'Space Grotesk', sans-serif; font-size: 10px; color: #a1a1aa; margin-bottom: 0.25rem; text-transform: uppercase; }
        .scoutx-wld-stat-bar-bg { height: 4px; width: 100%; background-color: #0e0e0e; border-radius: 9999px; overflow: hidden; }
        .scoutx-wld-stat-bar-fill { height: 100%; background-color: #5DFF31; box-shadow: 0 0 8px rgba(93, 255, 49, 0.5); }

        .scoutx-wld-card-footer { background-color: rgba(14, 14, 14, 0.8); border-top: 1px solid rgba(255, 255, 255, 0.05); padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 10; }
        .scoutx-wld-btn-icon { background: none; border: none; cursor: pointer; transition: transform 0.2s; display: flex; align-items: center; justify-content: center; padding: 0; }
        .scoutx-wld-btn-icon:hover { transform: scale(1.1); }
        .scoutx-wld-btn-favorite { color: #5DFF31; }
        .scoutx-wld-btn-delete { color: #ef4444; }

        .scoutx-wld-link-btn { font-family: 'Space Grotesk', sans-serif; font-size: 10px; color: #a1a1aa; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; transition: color 0.2s; border: none; background: transparent; }
        .scoutx-wld-link-btn:hover { color: #ffffff; }

        .scoutx-wld-deco { position: absolute; top: -5rem; right: -5rem; width: 10rem; height: 10rem; background-color: rgba(93, 255, 49, 0.05); border-radius: 50%; filter: blur(24px); pointer-events: none; }
        
        .scoutx-wld-empty { text-align: center; padding: 4rem 2rem; border: 1px dashed rgba(255, 255, 255, 0.1); background-color: rgba(9, 9, 11, 0.2); border-radius: 0.75rem; }
        .scoutx-wld-empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
        .scoutx-wld-empty-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .scoutx-wld-empty-desc { color: #71717a; font-family: 'Inter', sans-serif; font-size: 0.875rem; }

        .scoutx-toast { position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999; padding: 0.875rem 1.25rem; border-radius: 0.25rem; color: white; font-weight: 600; font-family: 'Inter', sans-serif; font-size: 0.875rem; }

        .scoutx-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
        .scoutx-modal { background: #111; border: 1px solid #222; padding: 2rem; width: 100%; max-width: 400px; text-align: center; }
        .scoutx-modal h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 1.5rem; color: #fff; margin: 0 0 1.5rem 0; }
        .scoutx-modal p { color: #888; margin: 0 0 2rem 0; font-size: 0.875rem; }
        .scoutx-modal-btns { display: flex; gap: 1rem; }
        .scoutx-modal-btn { flex: 1; padding: 0.75rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; font-family: 'Space Grotesk', sans-serif; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; }
        .scoutx-modal-btn-danger { background: transparent; border: 1px solid #ef4444; color: #ef4444; }
        .scoutx-modal-btn-danger:hover { background: rgba(239, 68, 68, 0.1); }
        .scoutx-modal-btn-cancel { background: #222; color: #fff; }
        .scoutx-modal-btn-cancel:hover { background: #333; }
      `}</style>

      <div className="scoutx-wld-bg">
        <div className="scoutx-wld-container">

          {/* Toast */}
          {toast.show && (
            <div className="scoutx-toast" style={{ background: toast.ok ? "var(--success)" : "var(--danger)" }}>
              {toast.ok ? "✓" : "✗"} {toast.message}
            </div>
          )}

          <div className="scoutx-wld-top-nav">
            <Link href="/watchlists" className="scoutx-wld-back-link">
              ← Back to Watchlists
            </Link>
          </div>

          {/* Header */}
          <div className="scoutx-wld-header">
            <div className="scoutx-wld-title-group">
              <h1 className="scoutx-wld-title">{watchlist.ListName}</h1>
              <p className="scoutx-wld-subtitle">
                {watchlist.Players.length} player{watchlist.Players.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
                Created {new Date(watchlist.CreatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                {watchlist.OwnerName && ` by ${watchlist.OwnerName}`}
              </p>
            </div>
            {watchlist.Players.length >= 2 && (
              <Link href={`/compare?ids=${watchlist.Players.slice(0, 3).map((p) => p.PlayerID).join(",")}`} className="scoutx-wld-btn-compare">
                COMPARE PLAYERS
              </Link>
            )}
          </div>

          {/* Add player search */}
          {canManage && (
            <div className="scoutx-wld-search-container">
              <h3 className="scoutx-wld-search-title">Add Player to Watchlist</h3>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="scoutx-wld-search-input"
                  placeholder="Search by player name or club..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="scoutx-wld-search-dropdown">
                    {searchResults.map((p) => (
                      <button
                        key={p.PlayerID}
                        onClick={() => handleAddPlayer(p)}
                        disabled={addingId === p.PlayerID}
                        className="scoutx-wld-search-item"
                      >
                        <span style={{ fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{p.Name}</span>
                        <span style={{ color: "#a1a1aa", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif" }}>
                          {p.Position} · {p.Club ?? "—"}
                          {addingId === p.PlayerID && " — Adding..."}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Players Grid */}
          {watchlist.Players.length === 0 ? (
            <div className="scoutx-wld-empty">
              <div className="scoutx-wld-empty-icon">📭</div>
              <h3 className="scoutx-wld-empty-title">No players yet</h3>
              <p className="scoutx-wld-empty-desc">
                {canManage ? "Use the search above to add players to this watchlist." : "This watchlist is empty."}
              </p>
            </div>
          ) : (
            <div className="scoutx-wld-grid">
              {watchlist.Players.map((player) => (
                <article key={player.PlayerID} className="scoutx-wld-card">
                  <div className="scoutx-wld-card-content">
                    <div className="scoutx-wld-card-header">
                      <Link href={`/players/${player.PlayerID}`} style={{ textDecoration: 'none' }}>
                        <h2 className="scoutx-wld-card-name">{player.Name}</h2>
                      </Link>
                      <div className="scoutx-wld-score-badge">{player.AverageScore ?? "N/A"}</div>
                    </div>
                    
                    <div className="scoutx-wld-tags">
                      <span className="scoutx-wld-tag">{player.Position}</span>
                      {player.Age && <span className="scoutx-wld-tag">{player.Age} YEARS OLD</span>}
                      {player.Club && <span className="scoutx-wld-tag">{player.Club}</span>}
                    </div>

                    <div className="scoutx-wld-stats">
                      <div>
                        <div className="scoutx-wld-stat-header">
                          <span>AVERAGE SCORE</span>
                          <span>{player.AverageScore ? `${player.AverageScore}%` : "N/A"}</span>
                        </div>
                        <div className="scoutx-wld-stat-bar-bg">
                          <div className="scoutx-wld-stat-bar-fill" style={{ width: `${player.AverageScore ?? 0}%` }}></div>
                        </div>
                      </div>
                      {(player.Height || player.Weight) && (
                        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                          {player.Height && (
                            <div style={{ flex: 1 }}>
                              <div className="scoutx-wld-stat-header"><span>HEIGHT</span></div>
                              <div style={{ color: "#d4d4d8", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>{player.Height} cm</div>
                            </div>
                          )}
                          {player.Weight && (
                            <div style={{ flex: 1 }}>
                              <div className="scoutx-wld-stat-header"><span>WEIGHT</span></div>
                              <div style={{ color: "#d4d4d8", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>{player.Weight} kg</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="scoutx-wld-card-footer">
                    <button className="scoutx-wld-btn-icon scoutx-wld-btn-favorite">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </button>
                    <Link href={`/players/${player.PlayerID}`} className="scoutx-wld-link-btn">
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>visibility</span>
                      VIEW
                    </Link>
                    {canManage ? (
                      <button className="scoutx-wld-btn-icon scoutx-wld-btn-delete" onClick={() => setRemoveTarget(player)}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    ) : <div></div>}
                  </div>
                  
                  <div className="scoutx-wld-deco"></div>
                </article>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Remove confirmation */}
      {removeTarget && (
        <div className="scoutx-modal-overlay">
          <div className="scoutx-modal">
            <h3>Remove Player?</h3>
            <p>
              Remove <strong style={{ color: "#fff" }}>{removeTarget.Name}</strong> from this watchlist?
            </p>
            <div className="scoutx-modal-btns">
              <button className="scoutx-modal-btn scoutx-modal-btn-danger" onClick={handleRemove}>
                Remove
              </button>
              <button className="scoutx-modal-btn scoutx-modal-btn-cancel" onClick={() => setRemoveTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
