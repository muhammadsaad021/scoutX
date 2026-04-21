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

const POSITIONS = ["", "Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker"];

const SCORE_COLOR = (score: number | null) => {
  if (!score) return "var(--text-muted)";
  if (score >= 60) return "var(--success)";
  if (score >= 30) return "var(--warning)";
  return "var(--danger)";
};

const POSITION_BADGE: Record<string, string> = {
  Goalkeeper: "badge-warning",
  Defender: "badge-primary",
  Midfielder: "badge-success",
  Forward: "badge-danger",
  Winger: "badge-danger",
  Striker: "badge-danger",
};

export default function SearchPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  // Filter state
  const [query, setQuery]       = useState("");
  const [position, setPosition] = useState("");
  const [club, setClub]         = useState("");
  const [ageMin, setAgeMin]     = useState("");
  const [ageMax, setAgeMax]     = useState("");
  const [sortBy, setSortBy]     = useState("CreatedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [results, setResults]   = useState<Player[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  // Build URL params and fetch
  const runSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams();
    if (query)    params.set("q", query);
    if (position) params.set("position", position);
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
    setAgeMin(""); setAgeMax(""); setSortBy("CreatedAt"); setSortOrder("desc");
  };

  const activeFilters = [query, position, club, ageMin, ageMax].filter(Boolean).length;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>Advanced Search</h1>
        <p>Filter players by position, age, club, or performance score.</p>
      </div>

      {/* Filter Panel */}
      <div className="card animate-fade-in" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem" }}>🔍 Search Filters</h3>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="btn btn-secondary"
              style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}>
              Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {/* Global text search */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Search by Name or Club</label>
            <input
              id="input-search-query"
              type="text"
              className="input"
              placeholder="e.g. Ronaldo, Al-Nassr..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Position */}
          <div>
            <label className="label">Position</label>
            <select id="select-position" className="select" value={position}
              onChange={(e) => setPosition(e.target.value)}>
              <option value="">All Positions</option>
              {POSITIONS.filter(Boolean).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Club */}
          <div>
            <label className="label">Club</label>
            <input
              id="input-club-filter"
              type="text"
              className="input"
              placeholder="e.g. Barcelona..."
              value={club}
              onChange={(e) => setClub(e.target.value)}
            />
          </div>

          {/* Age Min */}
          <div>
            <label className="label">Min Age</label>
            <input
              id="input-age-min"
              type="number"
              className="input"
              placeholder="e.g. 18"
              min={10} max={60}
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
            />
          </div>

          {/* Age Max */}
          <div>
            <label className="label">Max Age</label>
            <input
              id="input-age-max"
              type="number"
              className="input"
              placeholder="e.g. 30"
              min={10} max={60}
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="label">Sort By</label>
            <select id="select-sort-by" className="select" value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}>
              <option value="CreatedAt">Date Added</option>
              <option value="Name">Name (A-Z)</option>
              <option value="Age">Age</option>
              <option value="Position">Position</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="label">Order</label>
            <select id="select-sort-order" className="select" value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          {loading ? "Searching..." : searched ? `${results.length} player${results.length !== 1 ? "s" : ""} found` : ""}
        </p>
        {(userRole === "Scout" || userRole === "Admin") && (
          <Link href="/players/new" id="btn-add-player-search" className="btn btn-primary"
            style={{ padding: "0.4rem 0.875rem", fontSize: "0.8rem" }}>
            + Add Player
          </Link>
        )}
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          Searching...
        </div>
      ) : results.length === 0 && searched ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔎</div>
          <h3 style={{ marginBottom: "0.5rem" }}>No players found</h3>
          <p style={{ color: "var(--text-muted)" }}>Try adjusting your filters or clearing them.</p>
          <button onClick={clearFilters} className="btn btn-secondary" style={{ marginTop: "1rem" }}>
            Clear all filters
          </button>
        </div>
      ) : results.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Position</th>
                <th>Age</th>
                <th>Club</th>
                <th>Height</th>
                <th>Matches</th>
                <th>Avg Score</th>
                <th>Scout</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((player) => (
                <tr key={player.PlayerID} className="animate-fade-in">
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{player.Name}</td>
                  <td>
                    <span className={`badge ${POSITION_BADGE[player.Position] || "badge-primary"}`}>
                      {player.Position}
                    </span>
                  </td>
                  <td>{player.Age ?? "—"}</td>
                  <td>{player.Club ?? "—"}</td>
                  <td>{player.Height ? `${player.Height} cm` : "—"}</td>
                  <td style={{ color: "var(--text-muted)" }}>{player.MatchesPlayed}</td>
                  <td>
                    {player.AverageScore != null ? (
                      <span style={{ fontWeight: 700, color: SCORE_COLOR(player.AverageScore) }}>
                        {player.AverageScore}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No data</span>
                    )}
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {player.Users?.Name ?? "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link
                        href={`/players/${player.PlayerID}`}
                        id={`btn-view-search-${player.PlayerID}`}
                        className="btn btn-secondary"
                        style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
                      >
                        View
                      </Link>
                      {(userRole === "Scout" || userRole === "Admin") && (
                        <Link
                          href={`/players/${player.PlayerID}/edit`}
                          id={`btn-edit-search-${player.PlayerID}`}
                          className="btn btn-secondary"
                          style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
