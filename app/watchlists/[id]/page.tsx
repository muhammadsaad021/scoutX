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
  if (!score) return "var(--text-muted)";
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
      <p style={{ color: "var(--text-muted)" }}>Loading watchlist...</p>
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

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <Link href="/watchlists" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            ← Back to Watchlists
          </Link>
          <h1 style={{ marginTop: "0.5rem", marginBottom: "0.25rem" }}>{watchlist.ListName}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            {watchlist.Players.length} player{watchlist.Players.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
            Created {new Date(watchlist.CreatedAt).toLocaleDateString()}
            {watchlist.OwnerName && ` by ${watchlist.OwnerName}`}
          </p>
        </div>
        {watchlist.Players.length >= 2 && (
          <Link
            href={`/compare?ids=${watchlist.Players.slice(0, 3).map((p) => p.PlayerID).join(",")}`}
            className="btn btn-secondary"
            id="btn-compare-watchlist"
          >
            ⚖️ Compare Players
          </Link>
        )}
      </div>

      {/* Add player search */}
      {canManage && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.875rem" }}>Add Player to Watchlist</h3>
          <div style={{ position: "relative" }}>
            <input
              id="input-watchlist-search"
              type="text"
              className="input"
              placeholder="Search by player name or club..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
                background: "var(--bg-card)", border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", overflow: "hidden",
              }}>
                {searchResults.map((p) => (
                  <button
                    key={p.PlayerID}
                    id={`btn-watchlist-add-${p.PlayerID}`}
                    onClick={() => handleAddPlayer(p)}
                    disabled={addingId === p.PlayerID}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      width: "100%", padding: "0.75rem 1rem", background: "none", border: "none",
                      borderBottom: "1px solid var(--border-color)", cursor: "pointer",
                      color: "var(--text-primary)", textAlign: "left", transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <span style={{ fontWeight: 600 }}>{p.Name}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
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

      {/* Players Table */}
      {watchlist.Players.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📭</div>
          <h3 style={{ marginBottom: "0.5rem" }}>No players yet</h3>
          <p style={{ color: "var(--text-muted)" }}>
            {canManage ? "Use the search above to add players to this watchlist." : "This watchlist is empty."}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Position</th>
                <th>Age</th>
                <th>Club</th>
                <th>Avg Score</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.Players.map((player) => (
                <tr key={player.PlayerID} className="animate-fade-in">
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{player.Name}</td>
                  <td>
                    <span className={`badge ${POSITION_BADGE[player.Position] || "badge-primary"}`}>
                      {player.Position}
                    </span>
                  </td>
                  <td>{player.Age ?? "—"}</td>
                  <td>{player.Club ?? "—"}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: SCORE_COLOR(player.AverageScore) }}>
                      {player.AverageScore ?? "—"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {player.AddedAt ? new Date(player.AddedAt).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link
                        href={`/players/${player.PlayerID}`}
                        id={`btn-view-wl-player-${player.PlayerID}`}
                        className="btn btn-secondary"
                        style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
                      >
                        View
                      </Link>
                      {canManage && (
                        <button
                          id={`btn-remove-wl-player-${player.PlayerID}`}
                          className="btn btn-danger"
                          style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
                          onClick={() => setRemoveTarget(player)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Remove confirmation */}
      {removeTarget && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "360px", textAlign: "center" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>Remove Player?</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Remove <strong style={{ color: "var(--text-primary)" }}>{removeTarget.Name}</strong> from this watchlist?
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button id="btn-confirm-remove" className="btn btn-danger" style={{ flex: 1 }} onClick={handleRemove}>
                Remove
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRemoveTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
