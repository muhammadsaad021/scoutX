"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Performance = {
  PerformanceID: number;
  MatchDate: string;
  Goals: number;
  Assists: number;
  Passes: number;
  Rating: number | null;
  Comments: string | null;
  CalculatedScore: number | null;
};

type ScoutNote = {
  NoteID: number;
  NoteText: string;
  CreatedAt: string;
  Users: { Name: string } | null;
};

type Player = {
  PlayerID: number;
  Name: string;
  Age: number | null;
  Position: string;
  Club: string | null;
  Height: number | null;
  Weight: number | null;
  CreatedAt: string;
  Users: { Name: string } | null;
  Performances: Performance[];
  ScoutNotes: ScoutNote[];
};

const STAT_BOX = (label: string, value: string | number | null) => (
  <div className="card" style={{ textAlign: "center", padding: "1rem" }}>
    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary)" }}>{value ?? "—"}</div>
    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{label}</div>
  </div>
);

export default function PlayerProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Inline scout notes form
  const [noteText, setNoteText] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", ok: true });

  const showToast = (message: string, ok = true) => {
    setToast({ show: true, message, ok });
    setTimeout(() => setToast({ show: false, message: "", ok: true }), 3000);
  };

  const fetchPlayer = useCallback(async () => {
    const res = await fetch(`/api/players/${id}`);
    if (res.status === 404) { setNotFound(true); setLoading(false); return; }
    const data = await res.json();
    setPlayer(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchPlayer(); }, [fetchPlayer]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNoteSubmitting(true);
    setNoteError("");

    const res = await fetch(`/api/players/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteText }),
    });

    const data = await res.json();
    if (!res.ok) {
      setNoteError(data.error || "Failed to save note.");
    } else {
      setNoteText("");
      showToast("Note added!");
      fetchPlayer();
    }
    setNoteSubmitting(false);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <p style={{ color: "var(--text-muted)" }}>Loading player profile...</p>
    </div>
  );

  if (notFound || !player) return (
    <div className="container" style={{ paddingTop: "2rem" }}>
      <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Player Not Found</h2>
        <Link href="/players" className="btn btn-primary">Back to Players</Link>
      </div>
    </div>
  );

  const totalGoals = player.Performances.reduce((s, p) => s + (p.Goals || 0), 0);
  const totalAssists = player.Performances.reduce((s, p) => s + (p.Assists || 0), 0);
  const totalPasses = player.Performances.reduce((s, p) => s + (p.Passes || 0), 0);
  const avgRating = player.Performances.length
    ? (player.Performances.reduce((s, p) => s + (p.Rating || 0), 0) / player.Performances.length).toFixed(1)
    : null;

  const isScoutOrAdmin = userRole === "Scout" || userRole === "Admin";

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

      {/* Back + Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <Link href="/players" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>← Back to Players</Link>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {isScoutOrAdmin && (
            <>
              <Link href={`/players/${id}/edit`} id="btn-edit-player" className="btn btn-secondary">Edit Profile</Link>
              <Link href={`/players/${id}/performance`} id="btn-add-performance" className="btn btn-primary">+ Add Performance</Link>
            </>
          )}
        </div>
      </div>

      {/* Player Header Card */}
      <div className="card animate-fade-in" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ marginBottom: "0.5rem" }}>{player.Name}</h2>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <span className="badge badge-primary">{player.Position}</span>
              {player.Club && <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>🏟️ {player.Club}</span>}
              {player.Age && <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>🎂 {player.Age} years old</span>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Added by</div>
            <div style={{ fontWeight: 600 }}>{player.Users?.Name ?? "Unknown Scout"}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
          {STAT_BOX("Height", player.Height ? `${player.Height} cm` : null)}
          {STAT_BOX("Weight", player.Weight ? `${player.Weight} kg` : null)}
          {STAT_BOX("Total Goals", totalGoals)}
          {STAT_BOX("Total Assists", totalAssists)}
          {STAT_BOX("Total Passes", totalPasses)}
          {STAT_BOX("Avg Rating", avgRating)}
        </div>
      </div>

      {/* Performance History */}
      <h3 style={{ marginBottom: "1rem" }}>Performance History ({player.Performances.length})</h3>
      {player.Performances.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          No performances recorded yet.
          {isScoutOrAdmin && (
            <Link href={`/players/${id}/performance`} style={{ display: "block", marginTop: "0.75rem", color: "var(--primary)" }}>
              + Add first performance
            </Link>
          )}
        </div>
      ) : (
        <div className="table-container" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead>
              <tr>
                <th>Match Date</th>
                <th>Goals</th>
                <th>Assists</th>
                <th>Passes</th>
                <th>Rating</th>
                <th>Score</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {player.Performances.map((perf) => (
                <tr key={perf.PerformanceID}>
                  <td>{new Date(perf.MatchDate).toLocaleDateString()}</td>
                  <td style={{ color: "var(--success)", fontWeight: 600 }}>{perf.Goals}</td>
                  <td>{perf.Assists}</td>
                  <td>{perf.Passes}</td>
                  <td>{perf.Rating?.toFixed(1) ?? "—"}</td>
                  <td>
                    {perf.CalculatedScore != null ? (
                      <span className="badge badge-success">{perf.CalculatedScore.toFixed(1)}</span>
                    ) : "—"}
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{perf.Comments || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Scout Notes */}
      <h3 style={{ marginBottom: "1rem" }}>Scout Notes ({player.ScoutNotes.length})</h3>

      {/* Inline add-note form (Scout/Admin only) */}
      {isScoutOrAdmin && (
        <form onSubmit={handleAddNote} style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <textarea
              id="input-note-text"
              className="textarea"
              rows={2}
              placeholder="Write a scout observation..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              style={{ resize: "vertical" }}
            />
            {noteError && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{noteError}</p>}
          </div>
          <button id="btn-add-note" type="submit" className="btn btn-primary"
            disabled={noteSubmitting || !noteText.trim()}
            style={{ marginTop: "0.125rem", whiteSpace: "nowrap" }}>
            {noteSubmitting ? "Saving..." : "Add Note"}
          </button>
        </form>
      )}

      {player.ScoutNotes.length === 0 ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
          No scout notes yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {player.ScoutNotes.map((note) => (
            <div key={note.NoteID} className="card animate-slide-in" style={{ padding: "1rem" }}>
              <p style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>{note.NoteText}</p>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                — {note.Users?.Name ?? "Scout"} &nbsp;·&nbsp; {new Date(note.CreatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
