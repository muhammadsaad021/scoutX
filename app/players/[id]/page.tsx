"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { generatePlayerReportPDF } from "@/lib/pdf-generator";
import PerformanceCharts from "@/components/PerformanceCharts";

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

export default function PlayerProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Inline scout notes form
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteError, setNoteError] = useState("");
  
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", ok: true });

  const showToast = (message: string, ok = true) => {
    setToast({ show: true, message, ok });
    setTimeout(() => setToast({ show: false, message: "", ok: true }), 3000);
  };

  // Watchlist state
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>("");
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);

  const fetchWatchlists = useCallback(async () => {
    if (userRole !== "Manager") return;
    try {
      const res = await fetch("/api/watchlists");
      if (res.ok) {
        const data = await res.json();
        setWatchlists(data);
        if (data.length > 0) setSelectedWatchlist(data[0].WatchListID.toString());
      }
    } catch (e) {
      console.error(e);
    }
  }, [userRole]);

  useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  const handleAddToWatchlist = async () => {
    if (!selectedWatchlist) {
      showToast("Please select a watchlist first.", false);
      return;
    }
    setIsAddingToWatchlist(true);
    try {
      const res = await fetch(`/api/watchlists/${selectedWatchlist}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerID: parseInt(id as string) }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Added to Watchlist!");
      } else {
        showToast(data.error || "Failed to add to watchlist.", false);
      }
    } catch (err) {
      showToast("An error occurred.", false);
    }
    setIsAddingToWatchlist(false);
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
      setShowNoteForm(false);
      showToast("Note added!");
      fetchPlayer();
    }
    setNoteSubmitting(false);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerID: id, format: "PDF" }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        showToast(data.error || "Failed to generate report.", false);
      } else {
        generatePlayerReportPDF(data.player);
        showToast("Report generated successfully!");
      }
    } catch (err) {
      showToast("An error occurred.", false);
    }
    setIsGeneratingReport(false);
  };

  if (loading) return (
    <div style={{ backgroundColor: "#141414", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <p style={{ color: "#00FF00", fontFamily: "'Space Grotesk', sans-serif", fontSize: "14px", letterSpacing: "2px", textTransform: "uppercase" }}>
        Loading Profile Analytics...
      </p>
    </div>
  );

  if (notFound || !player) return (
    <div style={{ backgroundColor: "#141414", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1.5rem" }}>
      <h2 style={{ color: "#FFFFFF", fontFamily: "'Inter', sans-serif", fontSize: "2rem" }}>Profile Not Found</h2>
      <Link href="/players" style={{ color: "#000000", backgroundColor: "#00FF00", padding: "0.5rem 1.5rem", textDecoration: "none", fontSize: "12px", textTransform: "uppercase", fontWeight: "600", fontFamily: "'Inter', sans-serif" }}>
        BACK TO PLAYERS
      </Link>
    </div>
  );

  const avgRating = player.Performances.length
    ? (player.Performances.reduce((s, p) => s + (p.Rating || 0), 0) / player.Performances.length).toFixed(1)
    : null;
    
  const isScoutOrAdmin = userRole === "Scout" || userRole === "Admin";

  return (
    <>
      <style>{`
        .scoutx-pp-bg { background-color: #000000; min-height: 100vh; padding: 2rem; width: 100%; color: #FFFFFF; font-family: 'Inter', sans-serif; }
        .scoutx-pp-container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
        
        .scoutx-pp-back { display: inline-flex; align-items: center; font-size: 10px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; transition: color 0.2s; margin-bottom: 0.5rem; }
        .scoutx-pp-back:hover { color: #FFFFFF; }
        
        .scoutx-pp-header { background-color: #0a0a0a; border: 1px solid #222222; padding: 2rem; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 2rem; border-radius: 8px; }
        
        .scoutx-pp-tags { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
        .scoutx-pp-tag-primary { padding: 2px 8px; background-color: rgba(0, 255, 0, 0.2); color: #00FF00; border: 1px solid rgba(0, 255, 0, 0.3); font-size: 10px; text-transform: uppercase; font-family: 'Space Grotesk', monospace; letter-spacing: 0.05em; }
        .scoutx-pp-tag-secondary { padding: 2px 8px; background-color: #2A2A2A; color: #A0A0A0; font-size: 10px; text-transform: uppercase; font-family: 'Space Grotesk', monospace; letter-spacing: 0.05em; }
        
        .scoutx-pp-name { font-size: 1.875rem; font-weight: 500; letter-spacing: -0.025em; margin: 0 0 1rem 0; font-family: 'Inter', sans-serif; text-transform: uppercase; }
        
        .scoutx-pp-meta-row { display: flex; gap: 2rem; font-size: 10px; text-transform: uppercase; font-family: 'Space Grotesk', monospace; letter-spacing: 0.05em; }
        .scoutx-pp-meta-label { color: #A0A0A0; margin-bottom: 0.25rem; }
        .scoutx-pp-meta-value { color: #FFFFFF; font-size: 0.875rem; font-family: 'Inter', sans-serif; }
        
        .scoutx-pp-score-col { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
        .scoutx-pp-score-label { font-size: 10px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.1em; margin: 0; }
        .scoutx-pp-score-val { font-size: 3rem; color: #00FF00; font-family: 'Space Grotesk', monospace; padding-bottom: 0.5rem; border-bottom: 2px solid #00FF00; line-height: 1; }
        
        .scoutx-pp-actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 0; flex-wrap: wrap; }
        .scoutx-pp-btn { padding: 0.5rem 1.5rem; font-size: 0.75rem; text-transform: uppercase; font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: background-color 0.2s; text-decoration: none; font-family: 'Inter', sans-serif; border: none; outline: none; }
        .scoutx-pp-btn-secondary { background-color: #2A2A2A; color: #FFFFFF; }
        .scoutx-pp-btn-secondary:hover { background-color: #333333; }
        .scoutx-pp-btn-primary { background-color: #00FF00; color: #000000; }
        .scoutx-pp-btn-primary:hover { background-color: #00CC00; }
        .scoutx-pp-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .scoutx-pp-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media (min-width: 1024px) { .scoutx-pp-grid { grid-template-columns: 1fr 1fr; } }
        
        .scoutx-pp-card { background-color: #0a0a0a; border: 1px solid #222222; padding: 1.5rem; display: flex; flex-direction: column; border-radius: 8px; }
        .scoutx-pp-card-title { font-size: 10px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px dashed #333333; padding-bottom: 0.75rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; margin-top: 0; font-weight: 400; }
        
        /* Scout Notes Timeline */
        .scoutx-pp-timeline { flex: 1; position: relative; padding: 1rem 0; }
        .scoutx-pp-timeline::before { content: ''; position: absolute; top: 0; bottom: 0; left: 50%; transform: translateX(-50%); width: 1px; background-color: transparent; border-right: 1px dashed #333333; }
        
        .scoutx-pp-note { position: relative; width: 100%; display: flex; margin-bottom: 3rem; }
        .scoutx-pp-note:last-child { margin-bottom: 0; }
        .scoutx-pp-note-right { justify-content: flex-end; }
        .scoutx-pp-note-left { justify-content: flex-start; }
        
        .scoutx-pp-note-content { width: calc(50% - 16px); }
        .scoutx-pp-note-right .scoutx-pp-note-content { padding-left: 1.5rem; }
        .scoutx-pp-note-left .scoutx-pp-note-content { padding-right: 1.5rem; }
        
        .scoutx-pp-note-box { border: 1px solid #222222; padding: 1rem; background-color: #000000; border-radius: 4px; }
        .scoutx-pp-note-date { font-size: 10px; color: #00FF00; text-transform: uppercase; font-family: 'Space Grotesk', monospace; letter-spacing: 0.05em; margin-bottom: 0.5rem; margin-top: 0; }
        .scoutx-pp-note-left .scoutx-pp-note-date { color: #A0A0A0; }
        .scoutx-pp-note-text { font-size: 0.75rem; color: #A0A0A0; line-height: 1.6; margin: 0; }
        
        .scoutx-pp-node { position: absolute; left: 50%; top: 1rem; transform: translateX(-50%); w-3 h-3; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #00FF00; background-color: #141414; z-index: 10; display: flex; align-items: center; justify-content: center; }
        .scoutx-pp-node-inner { width: 4px; height: 4px; border-radius: 50%; background-color: #00FF00; }
        .scoutx-pp-note-left .scoutx-pp-node { border-color: #333333; }
        .scoutx-pp-note-left .scoutx-pp-node-inner { display: none; }
        
        .scoutx-pp-add-note { font-size: 10px; color: #00FF00; text-transform: uppercase; letter-spacing: 0.1em; background: none; border: none; cursor: pointer; }
        .scoutx-pp-add-note:hover { color: rgba(0,255,0,0.8); }

        .scoutx-pp-note-input-container { margin-bottom: 1.5rem; border: 1px solid #222222; padding: 1rem; background-color: #000000; position: relative; z-index: 20; border-radius: 4px; }
        .scoutx-pp-note-textarea { width: 100%; background: transparent; border: none; color: #FFFFFF; font-size: 0.75rem; outline: none; resize: vertical; min-height: 60px; font-family: 'Inter', sans-serif; margin-bottom: 0.5rem; }
        
        /* Table */
        .scoutx-pp-table { width: 100%; text-align: left; font-size: 0.75rem; border-collapse: collapse; }
        .scoutx-pp-table th { font-size: 9px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #333333; padding-bottom: 1rem; font-weight: 400; }
        .scoutx-pp-table td { padding: 1rem 0; border-bottom: 1px solid rgba(51, 51, 51, 0.5); }
        .scoutx-pp-table tr:last-child td { border-bottom: none; }
        .scoutx-pp-td-date { color: #00FF00; font-family: 'Space Grotesk', monospace; width: 15%; }
        .scoutx-pp-td-score { color: #FFFFFF; width: 15%; }
        .scoutx-pp-td-val { color: #FFFFFF; font-weight: 500; text-align: left; width: 10%; }
        .scoutx-pp-td-dim { color: #A0A0A0; text-align: left; width: 10%; }
        .scoutx-pp-td-text { color: #A0A0A0; padding-left: 2rem; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 30%; text-align: left; }
        
        /* Toast */
        .scoutx-toast {
          position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999;
          padding: 0.875rem 1.25rem; border-radius: 0.25rem;
          color: white; font-size: 0.875rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      
      <div className="scoutx-pp-bg">
        <div className="scoutx-pp-container">
          
          {/* Toast */}
          {toast.show && (
            <div className="scoutx-toast" style={{ background: toast.ok ? "#2A2A2A" : "#ef4444", color: toast.ok ? "#FFF" : "#fff", borderLeft: toast.ok ? "3px solid #00FF00" : "none" }}>
              {toast.message}
            </div>
          )}

          {/* Back Link */}
          <div>
            <Link href="/players" className="scoutx-pp-back">
              <span className="material-symbols-outlined" style={{ fontSize: "14px", marginRight: "4px" }}>arrow_back</span>
              BACK TO PLAYERS
            </Link>
          </div>

          {/* Profile Header */}
          <div className="scoutx-pp-header">
            <div>
              <div className="scoutx-pp-tags">
                <span className="scoutx-pp-tag-primary">{player.Position}</span>
                <span className="scoutx-pp-tag-secondary">{player.Club || "FREE AGENT"}</span>
              </div>
              <h2 className="scoutx-pp-name">{player.Name}</h2>
              <div className="scoutx-pp-meta-row">
                <div>
                  <p className="scoutx-pp-meta-label">AGE</p>
                  <p className="scoutx-pp-meta-value">{player.Age || "—"}</p>
                </div>
                <div>
                  <p className="scoutx-pp-meta-label">NATION</p>
                  <p className="scoutx-pp-meta-value">N/A</p>
                </div>
                <div>
                  <p className="scoutx-pp-meta-label">FOOT</p>
                  <p className="scoutx-pp-meta-value">RIGHT</p>
                </div>
              </div>
            </div>
            
            <div className="scoutx-pp-score-col">
              <p className="scoutx-pp-score-label">SCORE</p>
              <div className="scoutx-pp-score-val">
                {avgRating ? Math.round(parseFloat(avgRating) * 10) : "—"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="scoutx-pp-actions">
            <button onClick={handleGenerateReport} disabled={isGeneratingReport} className="scoutx-pp-btn scoutx-pp-btn-secondary">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>download</span> 
              EXPORT PLAYER PDF
            </button>
            {userRole === "Manager" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#0a0a0a", border: "1px solid #222", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                  <select 
                    value={selectedWatchlist} 
                    onChange={(e) => setSelectedWatchlist(e.target.value)}
                    style={{ background: "transparent", color: "#FFF", border: "none", outline: "none", fontSize: "0.75rem", fontFamily: "'Inter', sans-serif", width: "120px" }}
                  >
                    {watchlists.length === 0 ? (
                      <option value="">No watchlists</option>
                    ) : (
                      watchlists.map(wl => (
                        <option key={wl.WatchListID} value={wl.WatchListID.toString()} style={{ background: "#222" }}>
                          {wl.ListName}
                        </option>
                      ))
                    )}
                  </select>
                  <button 
                    className="scoutx-pp-btn scoutx-pp-btn-secondary" 
                    onClick={handleAddToWatchlist}
                    disabled={isAddingToWatchlist || watchlists.length === 0}
                    style={{ padding: "0.25rem 0.75rem", margin: 0, height: "100%" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>bookmark_add</span> 
                    {isAddingToWatchlist ? "ADDING..." : "ADD"}
                  </button>
                </div>
                <Link href={`/compare?ids=${player.PlayerID}`} className="scoutx-pp-btn scoutx-pp-btn-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>compare_arrows</span> 
                  COMPARE
                </Link>
              </>
            )}
            {isScoutOrAdmin && (
              <>
                <Link href={`/players/${id}/performance`} className="scoutx-pp-btn scoutx-pp-btn-primary">
                  + ADD PERFORMANCE
                </Link>
                <Link href={`/players/${id}/edit`} className="scoutx-pp-btn scoutx-pp-btn-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span> 
                  EDIT DATA
                </Link>
              </>
            )}
          </div>

          {/* Bento Grid */}
          <div className="scoutx-pp-grid">
            
            {/* Tactical Matrix (Performance Charts) */}
            <div className="scoutx-pp-card" style={{ minHeight: "400px" }}>
              <h3 className="scoutx-pp-card-title">TACTICAL MATRIX</h3>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {player.Performances.length > 0 ? (
                  <div style={{ width: "100%" }}>
                    <PerformanceCharts playerId={player.PlayerID} />
                  </div>
                ) : (
                  <p style={{ color: "#71717a", fontSize: "12px", fontFamily: "'Inter', sans-serif" }}>No tactical data points recorded.</p>
                )}
              </div>
            </div>

            {/* Scout Notes Timeline */}
            <div className="scoutx-pp-card">
              <h3 className="scoutx-pp-card-title">
                SCOUT NOTES
                {isScoutOrAdmin && (
                  <button type="button" onClick={() => setShowNoteForm(!showNoteForm)} className="scoutx-pp-add-note">
                    ADD ENTRY +
                  </button>
                )}
              </h3>
              
              {showNoteForm && isScoutOrAdmin && (
                <form onSubmit={handleAddNote} className="scoutx-pp-note-input-container">
                  <textarea
                    className="scoutx-pp-note-textarea"
                    placeholder="Input tactical observations..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    required
                  />
                  {noteError && <p style={{ color: "#ef4444", fontSize: "10px", marginBottom: "0.5rem" }}>{noteError}</p>}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" disabled={noteSubmitting} className="scoutx-pp-btn scoutx-pp-btn-primary" style={{ padding: "0.25rem 1rem", fontSize: "10px" }}>
                      {noteSubmitting ? "SAVING..." : "SAVE"}
                    </button>
                  </div>
                </form>
              )}

              <div className="scoutx-pp-timeline">
                {player.ScoutNotes.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#71717a", fontSize: "12px", marginTop: "2rem", fontFamily: "'Inter', sans-serif" }}>No entries available.</p>
                ) : (
                  player.ScoutNotes.map((note, idx) => {
                    const isRight = idx % 2 === 0;
                    return (
                      <div key={note.NoteID} className={`scoutx-pp-note ${isRight ? 'scoutx-pp-note-right' : 'scoutx-pp-note-left'}`}>
                        {/* Node */}
                        <div className="scoutx-pp-node">
                          <div className="scoutx-pp-node-inner"></div>
                        </div>
                        
                        {/* Content */}
                        <div className="scoutx-pp-note-content">
                          <div className="scoutx-pp-note-box">
                            <p className="scoutx-pp-note-date">
                              {new Date(note.CreatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {note.Users?.Name ? ` · ${note.Users.Name}` : ""}
                            </p>
                            <p className="scoutx-pp-note-text">{note.NoteText}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Performance History Table */}
          <div className="scoutx-pp-card" style={{ marginTop: "0" }}>
            <h3 className="scoutx-pp-card-title">PERFORMANCE HISTORY ({player.Performances.length})</h3>
            
            {player.Performances.length === 0 ? (
               <p style={{ color: "#71717a", fontSize: "12px", padding: "2rem 0", fontFamily: "'Inter', sans-serif" }}>No performances recorded.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="scoutx-pp-table">
                  <thead>
                    <tr>
                      <th className="scoutx-pp-td-date">MATCH DATE</th>
                      <th className="scoutx-pp-td-score">SCORE</th>
                      <th className="scoutx-pp-td-dim">GOALS</th>
                      <th className="scoutx-pp-td-dim">ASSISTS</th>
                      <th className="scoutx-pp-td-dim">PASSES</th>
                      <th className="scoutx-pp-td-dim">RATING</th>
                      <th className="scoutx-pp-td-text">COMMENTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {player.Performances.map((perf) => (
                      <tr key={perf.PerformanceID}>
                        <td className="scoutx-pp-td-date">{new Date(perf.MatchDate).toISOString().split('T')[0]}</td>
                        <td className="scoutx-pp-td-score">{perf.CalculatedScore != null ? perf.CalculatedScore.toFixed(0) : "—"}</td>
                        <td className="scoutx-pp-td-dim">{perf.Goals}</td>
                        <td className="scoutx-pp-td-val">{perf.Assists}</td>
                        <td className="scoutx-pp-td-dim">{perf.Passes}</td>
                        <td className="scoutx-pp-td-dim">{perf.Rating?.toFixed(1) ?? "—"}</td>
                        <td className="scoutx-pp-td-text" title={perf.Comments || ""}>{perf.Comments || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
