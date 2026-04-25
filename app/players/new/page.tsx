"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker"];

export default function NewPlayerPage() {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [position, setPosition] = useState("Forward");
  const [club, setClub] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age, position, club, height, weight }),
    });

    const data = await res.json();

    if (!res.ok) {
      setFormError(data.error || "Failed to create player.");
      setSubmitting(false);
    } else {
      router.push(`/players/${data.PlayerID}`);
    }
  };

  return (
    <>
      <style>{`
        .scoutx-add-bg { background-color: #000000; min-height: 100vh; padding: 3rem 2rem; width: 100%; }
        .scoutx-add-container { max-width: 800px; margin: 0 auto; }
        .scoutx-add-header-line { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
        .scoutx-add-line { width: 3rem; height: 1px; background-color: #5DFF31; }
        .scoutx-add-subtitle { color: #5DFF31; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; font-family: 'Inter', sans-serif; }
        .scoutx-add-title { font-size: 3rem; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: -0.02em; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.1; margin: 0 0 3rem 0; }
        @media (min-width: 1024px) {
          .scoutx-add-title { font-size: 3.5rem; }
        }
        .scoutx-add-title-highlight { color: #5DFF31; }
        
        .scoutx-add-card {
          background-color: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          padding: 32px;
          margin-bottom: 1.5rem;
          position: relative;
        }
        .scoutx-add-label {
          color: #5DFF31;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          display: block;
          margin-bottom: 0.5rem;
          font-family: 'Inter', sans-serif;
        }
        .scoutx-add-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .scoutx-add-input {
          width: 100%;
          background-color: #111111;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          padding: 1rem;
          font-size: 1.125rem;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .scoutx-add-input-lg {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .scoutx-add-input:focus { border-color: #5DFF31; box-shadow: 0 0 0 1px #5DFF31; }
        .scoutx-add-input::placeholder { color: #52525b; }
        
        select.scoutx-add-input {
          appearance: none;
        }
        
        .scoutx-add-select-icon {
          position: absolute;
          right: 1rem;
          pointer-events: none;
          color: #71717a;
        }
        
        .scoutx-add-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media (min-width: 768px) { .scoutx-add-grid { grid-template-columns: 1fr 1fr; } }
        
        .scoutx-add-btn {
          background-color: #5DFF31;
          color: #000000;
          font-weight: 700;
          font-size: 1.125rem;
          padding: 1rem 3rem;
          border-radius: 0.25rem;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
          width: 100%;
          max-width: 400px;
          margin: 2rem auto 0 auto;
        }
        .scoutx-add-btn:hover {
          box-shadow: 0 0 20px rgba(93, 255, 49, 0.3);
          background-color: #bef264;
        }
        .scoutx-add-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .scoutx-add-error {
          padding: 1rem;
          border-radius: 0.25rem;
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        /* Physical Attributes specific styles */
        .scoutx-phys-line {
          position: absolute;
          left: 1.5rem;
          top: 2rem;
          bottom: 2rem;
          width: 2px;
          background-color: #5DFF31;
        }
        .scoutx-phys-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .scoutx-phys-title {
          color: #ffffff;
          font-weight: 700;
          font-size: 1.125rem;
        }
        .scoutx-phys-subtitle {
          color: #71717a;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .scoutx-phys-input-box {
          display: flex;
          align-items: center;
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          padding: 0.25rem;
        }
        .scoutx-phys-btn {
          width: 2.5rem;
          height: 2.5rem;
          color: #a1a1aa;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .scoutx-phys-btn:hover { color: #ffffff; }
        .scoutx-phys-input-inner {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          padding: 0 1rem;
        }
        .scoutx-phys-input {
          width: 3rem;
          background: transparent;
          border: none;
          text-align: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          outline: none;
          padding: 0;
          margin: 0;
        }
        .scoutx-phys-unit {
          font-size: 0.75rem;
          color: #71717a;
        }
      `}</style>
      <div className="scoutx-add-bg">
        <div className="scoutx-add-container">
          <header>
            <div className="scoutx-add-header-line">
              <div className="scoutx-add-line"></div>
              <span className="scoutx-add-subtitle">System Entry Module</span>
            </div>
            <h2 className="scoutx-add-title">
              ADD NEW PLAYER <span className="scoutx-add-title-highlight">TO DATABASE</span>
            </h2>
          </header>

          {formError && (
            <div className="scoutx-add-error">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            {/* Section 1 */}
            <div className="scoutx-add-card">
              <div style={{ marginBottom: "2rem" }}>
                <label className="scoutx-add-label">Player Full Name *</label>
                <input 
                  type="text" 
                  required
                  className="scoutx-add-input scoutx-add-input-lg" 
                  placeholder="E.G. MARCUS RASHFORD"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="scoutx-add-grid">
                <div>
                  <label className="scoutx-add-label">Age *</label>
                  <input 
                    type="number"
                    required
                    min="10"
                    max="60"
                    className="scoutx-add-input" 
                    placeholder="E.G. 23"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div>
                  <label className="scoutx-add-label">Position *</label>
                  <div className="scoutx-add-input-wrapper">
                    <select 
                      required
                      className="scoutx-add-input"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    >
                      <option disabled value="">SELECT POSITION</option>
                      {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <span className="material-symbols-outlined scoutx-add-select-icon">keyboard_arrow_down</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="scoutx-add-card">
              <label className="scoutx-add-label">Current Club</label>
              <input 
                type="text" 
                className="scoutx-add-input" 
                placeholder="ENTER CLUB NAME..."
                value={club}
                onChange={(e) => setClub(e.target.value)}
              />
            </div>

            {/* Section 3: Physical Attributes */}
            <div className="scoutx-add-card" style={{ paddingLeft: "3.5rem" }}>
              <div className="scoutx-phys-line"></div>
              <h3 className="scoutx-add-label" style={{ marginBottom: "1.5rem" }}>Physical Attributes</h3>
              
              <div className="scoutx-add-grid">
                <div className="scoutx-phys-row">
                  <div>
                    <div className="scoutx-phys-title">Height</div>
                    <div className="scoutx-phys-subtitle">Vertical Measurement</div>
                  </div>
                  <div className="scoutx-phys-input-box">
                    <button type="button" className="scoutx-phys-btn" onClick={() => setHeight(String(Math.max(100, Number(height || 180) - 1)))}>
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <div className="scoutx-phys-input-inner">
                      <input type="number" className="scoutx-phys-input" placeholder="0" value={height} onChange={(e) => setHeight(e.target.value)} />
                      <span className="scoutx-phys-unit">CM</span>
                    </div>
                    <button type="button" className="scoutx-phys-btn" onClick={() => setHeight(String(Math.min(250, Number(height || 180) + 1)))}>
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>

                <div className="scoutx-phys-row">
                  <div>
                    <div className="scoutx-phys-title">Weight</div>
                    <div className="scoutx-phys-subtitle">Body Mass Index</div>
                  </div>
                  <div className="scoutx-phys-input-box">
                    <button type="button" className="scoutx-phys-btn" onClick={() => setWeight(String(Math.max(40, Number(weight || 75) - 1)))}>
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <div className="scoutx-phys-input-inner">
                      <input type="number" className="scoutx-phys-input" placeholder="0" value={weight} onChange={(e) => setWeight(e.target.value)} />
                      <span className="scoutx-phys-unit">KG</span>
                    </div>
                    <button type="button" className="scoutx-phys-btn" onClick={() => setWeight(String(Math.min(150, Number(weight || 75) + 1)))}>
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button type="submit" className="scoutx-add-btn" disabled={submitting}>
              {submitting ? "INITIALIZING..." : "INITIALIZE & SAVE PLAYER TO DATABASE"}
              <span className="material-symbols-outlined">rocket_launch</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
