"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type ComparedPlayer = {
  PlayerID: number;
  Name: string;
  Position: string;
  Club: string | null;
  Age: number | null;
  Height: number | null;
  Weight: number | null;
  ScoutName: string | null;
  MatchesPlayed: number;
  TotalGoals: number;
  TotalAssists: number;
  TotalPasses: number;
  AvgRating: number | null;
  AverageScore: number | null;
  GoalsPerMatch: number | null;
  AssistsPerMatch: number | null;
  PassesPerMatch: number | null;
};

type SearchResult = { PlayerID: number; Name: string; Position: string; Club: string | null };

const SCORE_COLOR = (score: number | null) => {
  if (score === null) return "var(--text-muted)";
  if (score >= 60) return "var(--success)";
  if (score >= 30) return "var(--warning)";
  return "var(--danger)";
};

// Highlights the best value across compared players
const isBest = (val: number | null, all: (number | null)[], higherIsBetter = true) => {
  const nums = all.filter((v): v is number => v !== null);
  if (nums.length < 2 || val === null) return false;
  return higherIsBetter ? val === Math.max(...nums) : val === Math.min(...nums);
};

type StatRowProps = {
  label: string;
  values: (number | null)[];
  higherIsBetter?: boolean;
  suffix?: string;
  colorFn?: (v: number | null) => string;
};

function StatRow({ label, values, higherIsBetter = true, suffix = "", colorFn }: StatRowProps) {
  return (
    <tr>
      <td style={{
        fontWeight: 500, color: "var(--text-muted)", fontSize: "0.8rem",
        textTransform: "uppercase", letterSpacing: "0.04em",
        background: "var(--bg-secondary)", width: "160px",
      }}>
        {label}
      </td>
      {values.map((val, i) => {
        const best = isBest(val, values, higherIsBetter);
        return (
          <td key={i} style={{
            textAlign: "center", fontWeight: best ? 700 : 400,
            color: colorFn ? colorFn(val) : best ? "var(--primary)" : "var(--text-primary)",
            background: best ? "rgba(79,70,229,0.06)" : undefined,
            fontSize: "0.95rem",
          }}>
            {val !== null ? `${val}${suffix}` : "—"}
            {best && val !== null && (
              <span style={{ marginLeft: "0.35rem", fontSize: "0.7rem", color: "var(--primary)" }}>▲</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Selected player IDs (up to 3)
  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    const ids = searchParams.get("ids");
    return ids ? ids.split(",").map(Number).filter(Boolean) : [];
  });
  const [compared, setCompared] = useState<ComparedPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Player search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Sync URL with selected IDs
  useEffect(() => {
    if (selectedIds.length > 0) {
      router.replace(`/compare?ids=${selectedIds.join(",")}`, { scroll: false });
    } else {
      router.replace("/compare", { scroll: false });
    }
  }, [selectedIds]);

  // Fetch comparison data when IDs change
  useEffect(() => {
    if (selectedIds.length < 2) {
      setCompared([]);
      return;
    }
    setLoading(true);
    setError("");
    fetch(`/api/players/compare?ids=${selectedIds.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setCompared([]); }
        else setCompared(data);
        setLoading(false);
      });
  }, [selectedIds]);

  // Player search
  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const res = await fetch(`/api/players?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data = await res.json();
      setSearchResults(
        data
          .filter((p: any) => !selectedIds.includes(p.PlayerID))
          .slice(0, 6)
      );
    }
    setSearching(false);
  }, [selectedIds]);

  useEffect(() => {
    const t = setTimeout(() => runSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery, runSearch]);

  const addPlayer = (player: SearchResult) => {
    if (selectedIds.length >= 3) return;
    setSelectedIds((prev) => [...prev, player.PlayerID]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removePlayer = (id: number) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const hasData = compared.length >= 2;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>Player Comparison</h1>
        <p>Compare up to 3 players side-by-side across all stats.</p>
      </div>

      {/* Player Selector */}
      <div className="card animate-fade-in" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", marginBottom: "1.25rem" }}>
          Select Players{" "}
          <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.875rem" }}>
            ({selectedIds.length}/3 selected)
          </span>
        </h3>

        {/* Selected player chips */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {compared.map((player) => (
            <div key={player.PlayerID} style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.4rem 0.875rem", borderRadius: "var(--radius-full)",
              background: "var(--primary)", color: "white", fontWeight: 600, fontSize: "0.875rem",
            }}>
              <span>{player.Name}</span>
              <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>({player.Position})</span>
              <button
                onClick={() => removePlayer(player.PlayerID)}
                style={{
                  background: "none", border: "none", color: "white",
                  cursor: "pointer", padding: "0", fontSize: "1rem", lineHeight: 1,
                  marginLeft: "0.25rem", opacity: 0.7,
                }}
              >
                ×
              </button>
            </div>
          ))}
          {/* Placeholder chips for empty slots */}
          {Array.from({ length: Math.max(0, 2 - compared.length) }).map((_, i) => (
            <div key={`empty-${i}`} style={{
              padding: "0.4rem 1.25rem", borderRadius: "var(--radius-full)",
              border: "2px dashed var(--border-color)", color: "var(--text-muted)",
              fontSize: "0.875rem",
            }}>
              + Add player
            </div>
          ))}
        </div>

        {/* Search input */}
        {selectedIds.length < 3 && (
          <div style={{ position: "relative" }}>
            <input
              id="input-compare-search"
              type="text"
              className="input"
              placeholder="Search player by name or club..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Dropdown results */}
            {searchResults.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
                background: "var(--bg-card)", border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", overflow: "hidden",
              }}>
                {searchResults.map((player) => (
                  <button
                    key={player.PlayerID}
                    id={`btn-add-compare-${player.PlayerID}`}
                    onClick={() => addPlayer(player)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      width: "100%", padding: "0.75rem 1rem", background: "none", border: "none",
                      textAlign: "left", cursor: "pointer", color: "var(--text-primary)",
                      borderBottom: "1px solid var(--border-color)", transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <span style={{ fontWeight: 600 }}>{player.Name}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {player.Position} · {player.Club ?? "—"}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {searching && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.5rem" }}>Searching...</p>
            )}
          </div>
        )}

        {selectedIds.length === 3 && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Maximum 3 players selected. Remove one to add another.
          </p>
        )}
      </div>

      {/* Prompt */}
      {selectedIds.length < 2 && !loading && (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚖️</div>
          <h3 style={{ marginBottom: "0.5rem" }}>Select at least 2 players</h3>
          <p style={{ color: "var(--text-muted)" }}>
            Use the search above to find and add players to compare.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          Loading comparison...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card" style={{
          padding: "1rem", textAlign: "center",
          background: "rgba(239,68,68,0.1)", color: "var(--danger)",
        }}>
          {error}
        </div>
      )}

      {/* Comparison Table */}
      {hasData && !loading && (
        <div className="animate-fade-in">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ background: "var(--bg-secondary)", width: "160px" }}>Stat</th>
                  {compared.map((p) => (
                    <th key={p.PlayerID} style={{ textAlign: "center", background: "var(--bg-secondary)" }}>
                      <Link href={`/players/${p.PlayerID}`}
                        style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 700 }}>
                        {p.Name}
                      </Link>
                      <div style={{ fontWeight: 400, fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                        {p.Position}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Profile */}
                <tr>
                  <td colSpan={compared.length + 1} style={{
                    background: "var(--bg-tertiary)", color: "var(--text-muted)",
                    fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", padding: "0.4rem 1rem",
                  }}>
                    Profile
                  </td>
                </tr>
                <tr>
                  <td style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.04em" }}>Club</td>
                  {compared.map((p) => (
                    <td key={p.PlayerID} style={{ textAlign: "center" }}>{p.Club ?? "—"}</td>
                  ))}
                </tr>
                <StatRow label="Age" values={compared.map((p) => p.Age)} higherIsBetter={false} suffix=" yrs" />
                <StatRow label="Height" values={compared.map((p) => p.Height)} suffix=" cm" />
                <StatRow label="Weight" values={compared.map((p) => p.Weight)} suffix=" kg" />
                <StatRow label="Matches" values={compared.map((p) => p.MatchesPlayed)} />

                {/* Performance Totals */}
                <tr>
                  <td colSpan={compared.length + 1} style={{
                    background: "var(--bg-tertiary)", color: "var(--text-muted)",
                    fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", padding: "0.4rem 1rem",
                  }}>
                    Total Performance
                  </td>
                </tr>
                <StatRow label="Goals" values={compared.map((p) => p.TotalGoals)} />
                <StatRow label="Assists" values={compared.map((p) => p.TotalAssists)} />
                <StatRow label="Passes" values={compared.map((p) => p.TotalPasses)} />

                {/* Per-match averages */}
                <tr>
                  <td colSpan={compared.length + 1} style={{
                    background: "var(--bg-tertiary)", color: "var(--text-muted)",
                    fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", padding: "0.4rem 1rem",
                  }}>
                    Per Match Average
                  </td>
                </tr>
                <StatRow label="Goals / Match" values={compared.map((p) => p.GoalsPerMatch)} />
                <StatRow label="Assists / Match" values={compared.map((p) => p.AssistsPerMatch)} />
                <StatRow label="Passes / Match" values={compared.map((p) => p.PassesPerMatch)} />
                <StatRow label="Avg Rating" values={compared.map((p) => p.AvgRating)} suffix="" />

                {/* Score */}
                <tr>
                  <td colSpan={compared.length + 1} style={{
                    background: "var(--bg-tertiary)", color: "var(--text-muted)",
                    fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", padding: "0.4rem 1rem",
                  }}>
                    Overall Score
                  </td>
                </tr>
                <StatRow
                  label="Avg Score"
                  values={compared.map((p) => p.AverageScore)}
                  colorFn={SCORE_COLOR}
                />
              </tbody>
            </table>
          </div>

          {/* Winner banner */}
          {(() => {
            const scores = compared.map((p) => p.AverageScore);
            const best = scores.reduce((a, b) => ((b ?? -1) > (a ?? -1) ? b : a), null);
            const winner = best !== null ? compared.find((p) => p.AverageScore === best) : null;
            if (!winner) return null;
            return (
              <div style={{
                marginTop: "1.25rem", padding: "1rem 1.5rem",
                borderRadius: "var(--radius-md)", textAlign: "center",
                background: "linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(16,185,129,0.1) 100%)",
                border: "1px solid var(--primary)",
              }}>
                🏆 <strong style={{ color: "var(--primary)" }}>{winner.Name}</strong>{" "}
                <span style={{ color: "var(--text-secondary)" }}>
                  leads with an average score of{" "}
                  <strong style={{ color: SCORE_COLOR(winner.AverageScore) }}>{winner.AverageScore}</strong>
                </span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
