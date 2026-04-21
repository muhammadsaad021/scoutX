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

const POSITIONS = ["", "Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker"];

const POSITION_BADGE: Record<string, string> = {
  Goalkeeper: "badge-warning",
  Defender: "badge-primary",
  Midfielder: "badge-success",
  Forward: "badge-danger",
  Winger: "badge-danger",
  Striker: "badge-danger",
};

export default function PlayersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userRole = (session?.user as any)?.role;

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
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
    if (position) params.set("position", position);
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

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>

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
          <h1 style={{ marginBottom: "0.25rem" }}>Players</h1>
          <p>{players.length} player{players.length !== 1 ? "s" : ""} found</p>
        </div>
        {(userRole === "Scout" || userRole === "Admin") && (
          <Link href="/players/new" id="btn-add-player" className="btn btn-primary">
            + Add Player
          </Link>
        )}
      </div>

      {/* Search & Filter */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          id="input-search-players"
          type="text"
          className="input"
          placeholder="Search by name or club..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 2, minWidth: "200px" }}
        />
        <select
          id="select-filter-position"
          className="select"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          style={{ flex: 1, minWidth: "160px" }}
        >
          <option value="">All Positions</option>
          {POSITIONS.filter(Boolean).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Players Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading players...</div>
        ) : players.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            No players found.{(userRole === "Scout" || userRole === "Admin") && (
              <> Click <Link href="/players/new" style={{ color: "var(--primary)" }}>+ Add Player</Link> to get started.</>
            )}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Age</th>
                <th>Club</th>
                <th>Avg Score</th>
                <th>Added By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
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
                    {player.AverageScore != null ? (
                      <span style={{
                        fontWeight: 700,
                        color: player.AverageScore >= 60 ? "var(--success)" : player.AverageScore >= 30 ? "var(--warning)" : "var(--danger)"
                      }}>
                        {player.AverageScore}
                      </span>
                    ) : <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>}
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{player.Users?.Name ?? "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link
                        href={`/players/${player.PlayerID}`}
                        id={`btn-view-player-${player.PlayerID}`}
                        className="btn btn-secondary"
                        style={{ padding: "0.375rem 0.75rem", fontSize: "0.8rem" }}
                      >
                        View
                      </Link>
                      {(userRole === "Scout" || userRole === "Admin") && (
                        <Link
                          href={`/players/${player.PlayerID}/edit`}
                          id={`btn-edit-player-${player.PlayerID}`}
                          className="btn btn-secondary"
                          style={{ padding: "0.375rem 0.75rem", fontSize: "0.8rem" }}
                        >
                          Edit
                        </Link>
                      )}
                      {userRole === "Admin" && (
                        <button
                          id={`btn-delete-player-${player.PlayerID}`}
                          className="btn btn-danger"
                          style={{ padding: "0.375rem 0.75rem", fontSize: "0.8rem" }}
                          onClick={() => setDeleteTarget(player)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "380px", textAlign: "center" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>Delete Player?</h3>
            <p style={{ marginBottom: "1.5rem" }}>
              Are you sure you want to delete <strong style={{ color: "var(--text-primary)" }}>
              {deleteTarget.Name}</strong>? All their performance records will also be removed.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button id="btn-confirm-delete-player" className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>
                Yes, Delete
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
