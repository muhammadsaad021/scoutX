"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Player = { PlayerID: number; Name: string; Position: string };

export default function PerformancePage() {
  const { id } = useParams();
  const router = useRouter();

  const [player, setPlayer] = useState<Player | null>(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", ok: true });

  // Performance form
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [goals, setGoals] = useState("0");
  const [assists, setAssists] = useState("0");
  const [passes, setPasses] = useState("0");
  const [rating, setRating] = useState("7");
  const [comments, setComments] = useState("");

  // Live score preview
  const previewScore = () => {
    const g = parseInt(goals) || 0;
    const a = parseInt(assists) || 0;
    const p = parseInt(passes) || 0;
    const r = parseFloat(rating) || 0;
    return Math.min(g * 10 + a * 6 + p * 0.1 + r * 3, 100).toFixed(1);
  };

  const showToast = (message: string, ok = true) => {
    setToast({ show: true, message, ok });
    setTimeout(() => setToast({ show: false, message: "", ok: true }), 3000);
  };

  useEffect(() => {
    fetch(`/api/players/${id}`)
      .then((r) => r.json())
      .then((data) => setPlayer({ PlayerID: data.PlayerID, Name: data.Name, Position: data.Position }));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    const res = await fetch(`/api/players/${id}/performance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchDate, goals, assists, passes, rating, comments }),
    });

    const data = await res.json();

    if (!res.ok) {
      setFormError(data.error || "Failed to save performance.");
      setSubmitting(false);
    } else {
      showToast(`Performance saved! Score: ${data.CalculatedScore}`);
      // Reset form
      setGoals("0"); setAssists("0"); setPasses("0");
      setRating("7"); setComments("");
      setMatchDate(new Date().toISOString().split("T")[0]);
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: "640px" }}>

      {/* Toast */}
      {toast.show && (
        <div style={{
          position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999,
          padding: "0.875rem 1.25rem", borderRadius: "var(--radius-md)",
          background: toast.ok ? "var(--success)" : "var(--danger)",
          color: "white", fontWeight: 600, boxShadow: "var(--shadow-lg)",
          animation: "fadeIn 0.3s ease",
        }}>
          {toast.ok ? "✓" : "✗"} {toast.message}
        </div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <Link href={`/players/${id}`} style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          ← Back to {player?.Name ?? "Player"}
        </Link>
        <h1 style={{ marginTop: "0.75rem" }}>Add Performance Data</h1>
        {player && (
          <p style={{ marginTop: "0.25rem" }}>
            Recording match stats for <strong style={{ color: "var(--text-primary)" }}>{player.Name}</strong>{" "}
            <span className="badge badge-primary" style={{ marginLeft: "0.5rem" }}>{player.Position}</span>
          </p>
        )}
      </div>

      <div className="card animate-fade-in">
        {formError && (
          <div style={{
            padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1rem",
            background: "rgba(239,68,68,0.15)", color: "var(--danger)", fontSize: "0.875rem",
          }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Match Date */}
          <div>
            <label className="label">Match Date *</label>
            <input id="input-match-date" type="date" required className="input"
              value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="label">Goals *</label>
              <input id="input-goals" type="number" required min={0} max={20} className="input"
                value={goals} onChange={(e) => setGoals(e.target.value)} />
            </div>
            <div>
              <label className="label">Assists *</label>
              <input id="input-assists" type="number" required min={0} max={20} className="input"
                value={assists} onChange={(e) => setAssists(e.target.value)} />
            </div>
            <div>
              <label className="label">Passes *</label>
              <input id="input-passes" type="number" required min={0} max={200} className="input"
                value={passes} onChange={(e) => setPasses(e.target.value)} />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="label">Match Rating (0 – 10)</label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <input
                id="input-rating"
                type="range" min={0} max={10} step={0.5}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={{ flex: 1, accentColor: "var(--primary)" }}
              />
              <span style={{
                minWidth: "2.5rem", textAlign: "center",
                fontSize: "1.25rem", fontWeight: 700, color: "var(--primary)"
              }}>
                {rating}
              </span>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="label">Comments / Observations</label>
            <textarea
              id="input-comments"
              className="textarea"
              rows={3}
              placeholder="e.g. Strong first half, lost momentum after 60 mins..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Calculated Score Preview */}
          <div style={{
            padding: "1rem", borderRadius: "var(--radius-md)",
            background: "var(--bg-secondary)", border: "1px solid var(--border-color)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                CALCULATED PERFORMANCE SCORE
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Goals×10 + Assists×6 + Passes×0.1 + Rating×3
              </div>
            </div>
            <div style={{
              fontSize: "2rem", fontWeight: 800,
              color: parseFloat(previewScore()) >= 60 ? "var(--success)" :
                     parseFloat(previewScore()) >= 30 ? "var(--warning)" : "var(--danger)",
            }}>
              {previewScore()}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" id="btn-save-performance" className="btn btn-primary"
              disabled={submitting} style={{ flex: 1 }}>
              {submitting ? "Saving..." : "Save Performance"}
            </button>
            <Link href={`/players/${id}`} className="btn btn-secondary"
              style={{ flex: 1, justifyContent: "center" }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* View All button */}
      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <Link href={`/players/${id}`} style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          View all performances on player profile →
        </Link>
      </div>
    </div>
  );
}
