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
    <>
      <style>{`
        .scoutx-perf-bg { background-color: #000000; min-height: 100vh; padding: 2.5rem 1rem; color: #fff; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; }
        .scoutx-perf-container { max-width: 640px; width: 100%; display: flex; flex-direction: column; gap: 1.5rem; }
        
        .scoutx-perf-back { display: inline-flex; align-items: center; font-size: 0.6875rem; color: #888; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; transition: color 0.2s; font-weight: 600; margin-bottom: 0.5rem; }
        .scoutx-perf-back:hover { color: #fff; }
        
        .scoutx-perf-header { margin-bottom: 1rem; }
        .scoutx-perf-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 2rem; font-weight: 800; margin: 0 0 0.5rem 0; letter-spacing: -0.02em; }
        .scoutx-perf-subtitle { color: #888; font-size: 0.875rem; margin: 0; display: flex; align-items: center; gap: 0.75rem; }
        
        .scoutx-perf-tag { background-color: rgba(93, 255, 49, 0.1); color: #5DFF31; padding: 2px 8px; border-radius: 4px; font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(93, 255, 49, 0.3); }

        .scoutx-perf-card { background-color: #111; border: 1px solid #222; border-radius: 8px; padding: 2rem; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); }
        
        .scoutx-form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
        .scoutx-form-label { font-size: 0.6875rem; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.1em; }
        
        .scoutx-form-input { background-color: #0a0a0a; border: 1px solid #333; color: #fff; padding: 0.875rem 1rem; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 0.875rem; transition: all 0.2s; outline: none; }
        .scoutx-form-input:focus { border-color: #5DFF31; box-shadow: 0 0 0 1px rgba(93, 255, 49, 0.2); }
        .scoutx-form-input::placeholder { color: #444; }
        
        .scoutx-form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        
        .scoutx-range-container { display: flex; align-items: center; gap: 1rem; }
        .scoutx-range-input { flex: 1; accent-color: #5DFF31; height: 4px; background: #333; outline: none; border-radius: 2px; }
        .scoutx-range-value { min-width: 2.5rem; text-align: center; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.5rem; font-weight: 800; color: #5DFF31; }
        
        .scoutx-preview-box { padding: 1.25rem 1.5rem; border-radius: 4px; background-color: #0a0a0a; border: 1px solid #222; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .scoutx-preview-label { font-size: 0.6875rem; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem; font-weight: 700; }
        .scoutx-preview-formula { font-size: 0.6875rem; color: #555; font-family: 'Space Grotesk', monospace; }
        .scoutx-preview-score { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 2.5rem; font-weight: 800; line-height: 1; }
        
        .scoutx-btn-row { display: flex; gap: 1rem; }
        .scoutx-btn { flex: 1; padding: 0.875rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; border: none; cursor: pointer; transition: all 0.2s; text-align: center; text-decoration: none; display: inline-block; }
        .scoutx-btn-primary { background-color: #5DFF31; color: #000; }
        .scoutx-btn-primary:hover:not(:disabled) { background-color: #7aff54; box-shadow: 0 0 15px rgba(93, 255, 49, 0.4); }
        .scoutx-btn-secondary { background-color: #222; color: #fff; }
        .scoutx-btn-secondary:hover { background-color: #333; }
        .scoutx-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .scoutx-error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #EF4444; padding: 0.875rem; border-radius: 4px; font-size: 0.875rem; margin-bottom: 1.5rem; }

        .scoutx-toast {
          position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999;
          padding: 0.875rem 1.25rem; border-radius: 4px;
          color: #000; font-weight: 600; box-shadow: 0 10px 25px -3px rgba(0,0,0,0.5);
          font-family: 'Inter', sans-serif; font-size: 0.875rem;
        }
      `}</style>

      <div className="scoutx-perf-bg">
        <div className="scoutx-perf-container">

          {/* Toast */}
          {toast.show && (
            <div className="scoutx-toast" style={{ background: toast.ok ? "#5DFF31" : "#EF4444", color: toast.ok ? "#000" : "#fff" }}>
              {toast.message}
            </div>
          )}

          <div className="scoutx-perf-header">
            <Link href={`/players/${id}`} className="scoutx-perf-back">
              <span className="material-symbols-outlined" style={{ fontSize: "14px", marginRight: "4px" }}>arrow_back</span>
              Back to {player?.Name ?? "Profile"}
            </Link>
            <h1 className="scoutx-perf-title">ADD PERFORMANCE</h1>
            {player && (
              <p className="scoutx-perf-subtitle">
                Recording match data for <strong style={{ color: "#fff" }}>{player.Name}</strong>
                <span className="scoutx-perf-tag">{player.Position}</span>
              </p>
            )}
          </div>

          <div className="scoutx-perf-card">
            {formError && <div className="scoutx-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              
              <div className="scoutx-form-group">
                <label className="scoutx-form-label">Match Date *</label>
                <input 
                  type="date" 
                  required 
                  className="scoutx-form-input"
                  value={matchDate} 
                  onChange={(e) => setMatchDate(e.target.value)} 
                />
              </div>

              <div className="scoutx-form-row">
                <div className="scoutx-form-group" style={{ marginBottom: 0 }}>
                  <label className="scoutx-form-label">Goals *</label>
                  <input 
                    type="number" 
                    required min={0} max={20} 
                    className="scoutx-form-input"
                    value={goals} 
                    onChange={(e) => setGoals(e.target.value)} 
                  />
                </div>
                <div className="scoutx-form-group" style={{ marginBottom: 0 }}>
                  <label className="scoutx-form-label">Assists *</label>
                  <input 
                    type="number" 
                    required min={0} max={20} 
                    className="scoutx-form-input"
                    value={assists} 
                    onChange={(e) => setAssists(e.target.value)} 
                  />
                </div>
                <div className="scoutx-form-group" style={{ marginBottom: 0 }}>
                  <label className="scoutx-form-label">Passes *</label>
                  <input 
                    type="number" 
                    required min={0} max={200} 
                    className="scoutx-form-input"
                    value={passes} 
                    onChange={(e) => setPasses(e.target.value)} 
                  />
                </div>
              </div>

              <div className="scoutx-form-group">
                <label className="scoutx-form-label">Match Rating (0 – 10)</label>
                <div className="scoutx-range-container">
                  <input
                    type="range" min={0} max={10} step={0.5}
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="scoutx-range-input"
                  />
                  <span className="scoutx-range-value">{rating}</span>
                </div>
              </div>

              <div className="scoutx-form-group">
                <label className="scoutx-form-label">Comments / Observations</label>
                <textarea
                  className="scoutx-form-input"
                  rows={3}
                  placeholder="Input tactical observations..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="scoutx-preview-box">
                <div>
                  <div className="scoutx-preview-label">Calculated Score</div>
                  <div className="scoutx-preview-formula">G×10 + A×6 + P×0.1 + R×3</div>
                </div>
                <div className="scoutx-preview-score" style={{ color: parseFloat(previewScore()) >= 80 ? "#5DFF31" : parseFloat(previewScore()) >= 60 ? "#F5B041" : "#EF4444" }}>
                  {previewScore()}
                </div>
              </div>

              <div className="scoutx-btn-row">
                <button type="submit" className="scoutx-btn scoutx-btn-primary" disabled={submitting}>
                  {submitting ? "SAVING..." : "SAVE PERFORMANCE"}
                </button>
                <Link href={`/players/${id}`} className="scoutx-btn scoutx-btn-secondary">
                  CANCEL
                </Link>
              </div>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}
