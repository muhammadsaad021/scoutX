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
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem", maxWidth: "600px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/players" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          ← Back to Players
        </Link>
        <h1 style={{ marginTop: "0.75rem" }}>Add New Player</h1>
      </div>

      <div className="card">
        {formError && (
          <div style={{
            padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1rem",
            background: "rgba(239,68,68,0.15)", color: "var(--danger)", fontSize: "0.875rem",
          }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Full Name *</label>
              <input id="input-player-name" type="text" required className="input"
                placeholder="e.g. Cristiano Ronaldo"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="label">Position *</label>
              <select id="input-player-position" required className="select"
                value={position} onChange={(e) => setPosition(e.target.value)}>
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Age</label>
              <input id="input-player-age" type="number" className="input"
                placeholder="e.g. 23" min={10} max={60}
                value={age} onChange={(e) => setAge(e.target.value)} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Club</label>
              <input id="input-player-club" type="text" className="input"
                placeholder="e.g. Al-Nassr FC"
                value={club} onChange={(e) => setClub(e.target.value)} />
            </div>

            <div>
              <label className="label">Height (cm)</label>
              <input id="input-player-height" type="number" className="input"
                placeholder="e.g. 185" step="0.1" min={100} max={230}
                value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>

            <div>
              <label className="label">Weight (kg)</label>
              <input id="input-player-weight" type="number" className="input"
                placeholder="e.g. 82" step="0.1" min={40} max={130}
                value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="submit" id="btn-create-player" className="btn btn-primary"
              disabled={submitting} style={{ flex: 1 }}>
              {submitting ? "Creating..." : "Create Player"}
            </button>
            <Link href="/players" className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
