"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker"];

export default function EditPlayerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [position, setPosition] = useState("Forward");
  const [club, setClub] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [performances, setPerformances] = useState<any[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/players/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.Name || "");
        setAge(data.Age?.toString() || "");
        setPosition(data.Position || "Forward");
        setClub(data.Club || "");
        setHeight(data.Height?.toString() || "");
        setWeight(data.Weight?.toString() || "");
        if (data.Performances) {
          setPerformances(data.Performances);
        }
        setUpdatedAt(new Date().toISOString());
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    const res = await fetch(`/api/players/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age, position, club, height, weight }),
    });

    const data = await res.json();

    if (!res.ok) {
      setFormError(data.error || "Failed to update player.");
      setSubmitting(false);
    } else {
      router.push(`/players/${id}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently remove this player?")) return;
    setSubmitting(true);
    const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setFormError("Failed to delete player.");
      setSubmitting(false);
    } else {
      router.push("/players");
    }
  };

  if (loading) return (
    <div style={{ backgroundColor: "#000000", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <p style={{ color: "#00FF00", fontFamily: "'Space Grotesk', sans-serif", fontSize: "14px", letterSpacing: "2px", textTransform: "uppercase" }}>
        Loading Record...
      </p>
    </div>
  );

  return (
    <>
      <style>{`
        .scoutx-ep-bg { background-color: #000000; min-height: 100vh; padding: 2rem 1.5rem; width: 100%; color: #FFFFFF; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; justify-content: center; }
        .scoutx-ep-card { width: 100%; max-width: 800px; background-color: #0a0a0a; border: 1px solid #222222; border-radius: 12px; padding: 2.5rem; margin-bottom: 3rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        @media (min-width: 768px) { .scoutx-ep-card { padding: 3rem; } }
        
        .scoutx-ep-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #222222; padding-bottom: 2rem; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .scoutx-ep-title { font-size: 1.875rem; font-weight: 700; color: #FFFFFF; margin: 0 0 0.5rem 0; letter-spacing: -0.025em; }
        .scoutx-ep-subtitle { font-size: 0.75rem; color: #8A8A8A; font-family: 'Space Grotesk', monospace; letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }
        .scoutx-ep-status { border: 1px solid #2a4a20; background-color: #142410; color: #00FF00; padding: 0.375rem 0.75rem; border-radius: 4px; font-size: 10px; font-family: 'Space Grotesk', monospace; letter-spacing: 0.1em; text-transform: uppercase; display: flex; align-items: center; margin-top: 0.5rem; }

        .scoutx-ep-section { margin-bottom: 2rem; }
        .scoutx-ep-sec-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
        .scoutx-ep-sec-line { width: 2rem; height: 1px; background-color: #00FF00; }
        .scoutx-ep-sec-title { font-size: 0.75rem; font-family: 'Space Grotesk', monospace; color: #00FF00; letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }
        
        .scoutx-ep-grid { display: grid; grid-template-columns: 1fr; gap: 2rem 3rem; }
        @media (min-width: 768px) { .scoutx-ep-grid { grid-template-columns: 1fr 1fr; } }
        
        .scoutx-ep-field { display: flex; flex-direction: column; gap: 0.25rem; }
        .scoutx-ep-label { font-size: 10px; color: #8A8A8A; font-family: 'Space Grotesk', monospace; letter-spacing: 0.1em; text-transform: uppercase; }
        .scoutx-ep-input { background: transparent; border: none; border-bottom: 1px solid #222222; color: #FFFFFF; font-size: 1rem; padding: 0.5rem 0; font-family: 'Plus Jakarta Sans', sans-serif; transition: border-color 0.2s; outline: none; border-radius: 0; }
        .scoutx-ep-input:focus { border-color: #00FF00; }
        select.scoutx-ep-input { appearance: none; padding-right: 2rem; cursor: pointer; }
        .scoutx-ep-select-wrapper { position: relative; }
        .scoutx-ep-select-icon { position: absolute; right: 0; top: 50%; transform: translateY(-50%); color: #8A8A8A; pointer-events: none; font-size: 20px; }
        
        .scoutx-ep-phys-row { display: flex; align-items: center; justify-content: space-between; position: relative; }
        .scoutx-ep-phys-info { display: flex; flex-direction: column; }
        .scoutx-ep-phys-title { color: #FFFFFF; font-weight: 700; font-size: 1.125rem; }
        .scoutx-ep-phys-subtitle { color: #8A8A8A; font-size: 10px; text-transform: uppercase; font-family: 'Space Grotesk', monospace; letter-spacing: 0.05em; }
        .scoutx-ep-phys-input-box { display: flex; align-items: center; gap: 0.75rem; }
        .scoutx-ep-phys-input-wrap { background-color: #111111; border: 1px solid #222222; border-radius: 4px; padding: 0.5rem 1rem; width: 8rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .scoutx-ep-phys-input { background: transparent; border: none; color: #00FF00; font-size: 1.25rem; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; width: 100%; text-align: center; outline: none; padding: 0; -moz-appearance: textfield; }
        .scoutx-ep-phys-input::-webkit-outer-spin-button, .scoutx-ep-phys-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .scoutx-ep-phys-unit { font-size: 0.875rem; color: #8A8A8A; }

        .scoutx-ep-perf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (min-width: 768px) { .scoutx-ep-perf-grid { grid-template-columns: repeat(4, 1fr); } }
        .scoutx-ep-perf-card { background-color: #111111; border: 1px solid #222222; border-radius: 4px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between; height: 6rem; }
        .scoutx-ep-perf-card-primary { border-left: 2px solid #00FF00; }
        .scoutx-ep-perf-date { font-size: 10px; color: #8A8A8A; font-family: 'Space Grotesk', monospace; letter-spacing: 0.1em; text-transform: uppercase; }
        .scoutx-ep-perf-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
        .scoutx-ep-perf-score { font-size: 1.5rem; font-weight: 700; color: #FFFFFF; }
        .scoutx-ep-perf-score-dim { color: #8A8A8A; }
        .scoutx-ep-perf-metric { font-size: 0.75rem; font-family: 'Space Grotesk', monospace; color: #8A8A8A; }
        .scoutx-ep-perf-metric-highlight { color: #00FF00; }

        .scoutx-ep-note-area { display: flex; flex-direction: column; gap: 0.5rem; }
        .scoutx-ep-note-header { display: flex; align-items: center; gap: 0.5rem; color: #8A8A8A; margin-bottom: 0.5rem; }
        .scoutx-ep-note-title { font-size: 10px; font-family: 'Space Grotesk', monospace; letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }
        .scoutx-ep-textarea { width: 100%; background-color: #111111; border: none; border-radius: 4px; padding: 1.25rem; color: #8A8A8A; font-size: 0.875rem; font-family: 'Inter', sans-serif; resize: vertical; min-height: 100px; outline: none; transition: box-shadow 0.2s; }
        .scoutx-ep-textarea:focus { box-shadow: inset 0 0 0 1px #00FF00; color: #FFFFFF; }

        .scoutx-ep-actions { display: flex; flex-direction: column; gap: 1rem; padding-top: 2rem; border-top: 1px solid #222222; }
        @media (min-width: 640px) { .scoutx-ep-actions { flex-direction: row; } }
        
        .scoutx-ep-btn { flex: 1; padding: 1rem; border-radius: 4px; font-family: 'Space Grotesk', monospace; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; border: none; transition: all 0.2s; text-decoration: none; }
        .scoutx-ep-btn-primary { background-color: #00FF00; color: #000000; }
        .scoutx-ep-btn-primary:hover { background-color: #00CC00; }
        .scoutx-ep-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .scoutx-ep-btn-danger { background-color: transparent; border: 1px solid rgba(255, 77, 77, 0.3); color: #ff4d4d; }
        .scoutx-ep-btn-danger:hover { background-color: rgba(255, 77, 77, 0.1); }
        .scoutx-ep-btn-cancel { background-color: transparent; border: 1px solid #222222; color: #FFFFFF; flex: 0.5; }
        .scoutx-ep-btn-cancel:hover { background-color: #111111; }
        
        .scoutx-error { color: #ff4d4d; font-size: 0.875rem; margin-bottom: 1.5rem; font-family: 'Inter', sans-serif; padding: 1rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; }
      `}</style>

      <div className="scoutx-ep-bg">
        <div className="scoutx-ep-card">
          
          <div className="mb-6 pb-6" style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #222222", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 className="scoutx-ep-title">Update System Record</h2>
              <p className="scoutx-ep-subtitle">PLAYER ID: #{id?.toString().slice(0, 8)}</p>
            </div>
            <div className="scoutx-ep-status">
              RECORD ACTIVE
            </div>
          </div>

          {formError && <div className="scoutx-error">{formError}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            
            {/* Profile Section */}
            <section className="scoutx-ep-section" style={{ margin: 0 }}>
              <div className="scoutx-ep-sec-header">
                <div className="scoutx-ep-sec-line"></div>
                <h3 className="scoutx-ep-sec-title">PROFILE</h3>
              </div>
              
              <div className="scoutx-ep-grid">
                <div className="scoutx-ep-field">
                  <label className="scoutx-ep-label">FULLNAME</label>
                  <input type="text" className="scoutx-ep-input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="scoutx-ep-field">
                  <label className="scoutx-ep-label">AGE</label>
                  <input type="number" className="scoutx-ep-input" value={age} onChange={(e) => setAge(e.target.value)} required />
                </div>
                <div className="scoutx-ep-field">
                  <label className="scoutx-ep-label">ACTIVE CLUB</label>
                  <input type="text" className="scoutx-ep-input" value={club} onChange={(e) => setClub(e.target.value)} />
                </div>
                <div className="scoutx-ep-field">
                  <label className="scoutx-ep-label">TACTICAL POSITION</label>
                  <div className="scoutx-ep-select-wrapper">
                    <select className="scoutx-ep-input" value={position} onChange={(e) => setPosition(e.target.value)} style={{ width: "100%" }} required>
                      <option disabled value="">Select</option>
                      {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <span className="material-symbols-outlined scoutx-ep-select-icon">arrow_drop_down</span>
                  </div>
                </div>
              </div>
              <div style={{ paddingTop: "1rem" }}>
                <span style={{ fontSize: "10px", color: "#8A8A8A", fontStyle: "italic" }}>
                  Last Updated: {updatedAt ? new Date(updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A"}
                </span>
              </div>
            </section>

            {/* Physical Section */}
            <section className="scoutx-ep-section" style={{ margin: 0 }}>
              <div className="scoutx-ep-sec-header">
                <div className="scoutx-ep-sec-line"></div>
                <h3 className="scoutx-ep-sec-title">PHYSICAL</h3>
              </div>
              
              <div className="scoutx-ep-grid">
                <div className="scoutx-ep-phys-row">
                  <div className="scoutx-ep-phys-info">
                    <div className="scoutx-ep-phys-title">Height</div>
                    <div className="scoutx-ep-phys-subtitle">Vertical Measurement</div>
                  </div>
                  <div className="scoutx-ep-phys-input-wrap">
                    <input type="number" className="scoutx-ep-phys-input" placeholder="—" value={height} onChange={(e) => setHeight(e.target.value)} />
                    <span className="scoutx-ep-phys-unit">cm</span>
                  </div>
                </div>
                <div className="scoutx-ep-phys-row">
                  <div className="scoutx-ep-phys-info">
                    <div className="scoutx-ep-phys-title">Weight</div>
                    <div className="scoutx-ep-phys-subtitle">Body Mass Index</div>
                  </div>
                  <div className="scoutx-ep-phys-input-wrap">
                    <input type="number" className="scoutx-ep-phys-input" placeholder="—" value={weight} onChange={(e) => setWeight(e.target.value)} />
                    <span className="scoutx-ep-phys-unit">kg</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Performance Stats Section */}
            {performances.length > 0 && (
              <section className="scoutx-ep-section" style={{ margin: 0 }}>
                <div className="scoutx-ep-sec-header">
                  <div className="scoutx-ep-sec-line"></div>
                  <h3 className="scoutx-ep-sec-title">PERFORMANCE STATS</h3>
                </div>
                
                <div className="scoutx-ep-perf-grid">
                  {performances.slice(0, 4).map((perf, idx) => {
                    const isGood = (perf.Rating || 0) >= 8;
                    return (
                      <div key={idx} className={`scoutx-ep-perf-card ${isGood ? 'scoutx-ep-perf-card-primary' : ''}`}>
                        <div className="scoutx-ep-perf-date">
                          {new Date(perf.MatchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </div>
                        <div className="scoutx-ep-perf-bottom">
                          <span className={`scoutx-ep-perf-score ${!isGood ? 'scoutx-ep-perf-score-dim' : ''}`}>
                            {perf.Rating?.toFixed(1) || "—"}
                          </span>
                          <span className={`scoutx-ep-perf-metric ${isGood ? 'scoutx-ep-perf-metric-highlight' : ''}`}>
                            {perf.Goals}G
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Actions */}
            <div className="scoutx-ep-actions">
              <Link href={`/players/${id}`} className="scoutx-ep-btn scoutx-ep-btn-cancel">
                CANCEL
              </Link>
              <button type="button" onClick={handleDelete} className="scoutx-ep-btn scoutx-ep-btn-danger">
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete_forever</span>
                REMOVE PLAYER FROM SYSTEM
              </button>
              <button type="submit" className="scoutx-ep-btn scoutx-ep-btn-primary" disabled={submitting}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>sync</span>
                {submitting ? "APPLYING..." : "APPLY CHANGES"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
