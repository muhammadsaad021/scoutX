"use client";

import { useState, useEffect, useCallback } from "react";
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
  AverageScore: number | null;
  MatchesPlayed: number;
  Users: { Name: string } | null;
};

const POSITIONS = ["All Players", "Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker"];

export default function SearchPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  // Filter state
  const [query, setQuery]       = useState("");
  const [position, setPosition] = useState("");
  const [club, setClub]         = useState("");
  const [ageMin, setAgeMin]     = useState("");
  const [ageMax, setAgeMax]     = useState("");
  const [sortBy, setSortBy]     = useState("AverageScore"); // default to score for rankings
  const [sortOrder, setSortOrder] = useState("desc");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [results, setResults]   = useState<Player[]>([]);
  const [loading, setLoading]   = useState(true);
  const [searched, setSearched] = useState(false);

  // Build URL params and fetch
  const runSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams();
    if (query)    params.set("q", query);
    if (position && position !== "All Players") params.set("position", position);
    if (club)     params.set("club", club);
    if (ageMin)   params.set("ageMin", ageMin);
    if (ageMax)   params.set("ageMax", ageMax);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    const res = await fetch(`/api/players?${params}`);
    if (res.ok) setResults(await res.json());
    setLoading(false);
  }, [query, position, club, ageMin, ageMax, sortBy, sortOrder]);

  // Auto-search on filter change (debounced)
  useEffect(() => {
    const timer = setTimeout(runSearch, 350);
    return () => clearTimeout(timer);
  }, [runSearch]);

  const clearFilters = () => {
    setQuery(""); setPosition(""); setClub("");
    setAgeMin(""); setAgeMax(""); setSortBy("AverageScore"); setSortOrder("desc");
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: "1000px" }}>

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", margin: 0, fontWeight: 700 }}>Verified Talent Pool</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "1px" }}>
            {results.length} ACTIVE PROFILES IDENTIFIED
          </p>
        </div>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ background: "var(--color-bg-surface)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)", padding: "0.5rem 1rem", borderRadius: "4px", fontSize: "0.875rem", outline: "none" }}
        >
          <option value="AverageScore">SORT BY: HIGHEST OVR</option>
          <option value="CreatedAt">SORT BY: NEWEST</option>
          <option value="Name">SORT BY: NAME (A-Z)</option>
        </select>
      </div>

      {/* Search Bar Row */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }}>🔍</span>
          <input
            type="text"
            placeholder="SEARCH BY NAME, CLUB, OR POSITION..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "1rem 1rem 1rem 3rem",
              background: "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              color: "white",
              fontSize: "0.875rem",
              letterSpacing: "1px",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
          />
        </div>
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ 
            padding: "0 1.5rem", background: showAdvanced ? "var(--color-primary)" : "var(--color-bg-surface)", 
            color: showAdvanced ? "#000" : "var(--color-text-primary)", border: showAdvanced ? "none" : "1px solid var(--color-border)", 
            borderRadius: "4px", fontSize: "0.875rem", cursor: "pointer", fontWeight: 600,
            display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s ease"
          }}
        >
          ⚙️ ADVANCED FILTERS
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="card animate-slide-in" style={{ marginBottom: "1.5rem", borderLeft: "4px solid var(--color-primary)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label className="label">Club</label>
              <input type="text" className="input" placeholder="e.g. Barcelona" value={club} onChange={(e) => setClub(e.target.value)} />
            </div>
            <div>
              <label className="label">Min Age</label>
              <input type="number" className="input" placeholder="16" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
            </div>
            <div>
              <label className="label">Max Age</label>
              <input type="number" className="input" placeholder="40" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button onClick={clearFilters} className="btn" style={{ background: "transparent", color: "var(--danger)", border: "1px solid var(--danger)" }}>Clear Filters</button>
          </div>
        </div>
      )}

      {/* Position Chips */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {POSITIONS.map((pos) => {
          const isActive = pos === position || (pos === "All Players" && !position);
          return (
            <button
              key={pos}
              onClick={() => setPosition(pos === "All Players" ? "" : pos)}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                background: isActive ? "var(--color-primary)" : "var(--color-bg-surface)",
                color: isActive ? "#000" : "var(--color-text-secondary)",
                transition: "all 0.2s ease"
              }}
            >
              {pos}
            </button>
          )
        })}
      </div>

      {/* Results List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>Loading intelligence...</div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)", border: "1px dashed var(--color-border)", borderRadius: "4px" }}>
            No profiles match the active filters.
          </div>
        ) : (
          results.map((player) => (
            <Link 
              key={player.PlayerID} 
              href={`/players/${player.PlayerID}`}
              style={{ textDecoration: "none" }}
            >
              <div 
                className="animate-slide-in"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1.25rem",
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.boxShadow = "var(--shadow-glow)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <div style={{ width: "60px", height: "60px", background: "var(--color-bg-surface)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                    👤
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.25rem" }}>
                      <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--color-text-primary)" }}>{player.Name}</h3>
                      {player.AverageScore && player.AverageScore >= 80 && (
                        <span style={{ fontSize: "0.6rem", background: "var(--primary-light)", color: "var(--color-primary)", padding: "0.2rem 0.5rem", borderRadius: "2px", fontWeight: 700, letterSpacing: "1px" }}>
                          ELITE_PROSPECT
                        </span>
                      )}
                    </div>
                    <div style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                      {player.Club || "Free Agent"} • {player.Position} • {player.Age ? `${player.Age} Years Old` : "Age Unknown"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "3rem", textAlign: "right" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: player.AverageScore && player.AverageScore >= 80 ? "var(--color-primary)" : "var(--color-text-primary)", lineHeight: 1 }}>
                      {player.AverageScore ? Math.round(player.AverageScore) : "—"}
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", letterSpacing: "1px" }}>OVR SCORE</div>
                  </div>
                  <div style={{ width: "1px", height: "40px", background: "var(--color-border)" }}></div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1, marginBottom: "0.25rem" }}>
                      €{player.AverageScore ? Math.round((player.AverageScore * 1.5) + (Math.random() * 10)) : 10}M
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", letterSpacing: "1px" }}>VALUE</div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
