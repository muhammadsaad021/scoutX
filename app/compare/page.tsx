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

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    const ids = searchParams.get("ids");
    return ids ? ids.split(",").map(Number).filter(Boolean) : [];
  });
  const [compared, setCompared] = useState<ComparedPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [activePos, setActivePos] = useState("MIDFIELDER");

  useEffect(() => {
    if (selectedIds.length > 0) {
      router.replace(`/compare?ids=${selectedIds.join(",")}`, { scroll: false });
    } else {
      router.replace("/compare", { scroll: false });
    }
  }, [selectedIds, router]);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setCompared([]);
      return;
    }
    setLoading(true);
    fetch(`/api/players/compare?ids=${selectedIds.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setCompared(data);
        else setCompared([]);
        setLoading(false);
      });
  }, [selectedIds]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const res = await fetch(`/api/players?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data = await res.json();
      setSearchResults(data.filter((p: any) => !selectedIds.includes(p.PlayerID)).slice(0, 5));
    }
    setSearching(false);
  }, [selectedIds]);

  useEffect(() => {
    const t = setTimeout(() => runSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery, runSearch]);

  const addPlayer = (player: SearchResult) => {
    if (selectedIds.length >= 2) return; // Limit to 2 for this design
    setSelectedIds((prev) => [...prev, player.PlayerID]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removePlayer = (id: number) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const p1 = compared[0];
  const p2 = compared[1];

  const getWinner = (val1: number | null, val2: number | null, higherIsBetter = true) => {
    if (val1 === null || val2 === null) return 0;
    if (val1 === val2) return 0;
    if (higherIsBetter) return val1 > val2 ? 1 : 2;
    return val1 < val2 ? 1 : 2;
  };

  const renderVal = (p: ComparedPlayer | undefined, val: number | null, winner: boolean, isLarge: boolean = false, suffix: string = "") => {
    if (!p) return <div className={`scoutx-comp-td-val${isLarge ? "-large" : ""}`}>—</div>;
    const disp = val !== null ? `${val}${suffix}` : "—";
    return (
      <div className={`scoutx-comp-td-val${isLarge ? "-large" : ""} ${winner ? "highlight" : ""}`}>
        {disp}
      </div>
    );
  };

  const bestScore = Math.max(p1?.AverageScore || 0, p2?.AverageScore || 0);
  const overallWinner = p1?.AverageScore === bestScore && p1?.AverageScore ? p1 : p2?.AverageScore === bestScore && p2?.AverageScore ? p2 : null;

  return (
    <>
      <style>{`
        .scoutx-comp-bg { background-color: #111111; min-height: 100vh; padding: 2.5rem; color: #FFFFFF; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; }
        .scoutx-comp-container { max-width: 1200px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 1.5rem; }

        .scoutx-comp-header { display: flex; flex-direction: column; justify-content: space-between; align-items: center; gap: 1.5rem; background-color: #1A1A1A; border-radius: 0.75rem; border: 1px solid #333333; padding: 1rem; box-shadow: 0 4px 24px rgba(0,0,0,0.5); }
        @media (min-width: 768px) { .scoutx-comp-header { flex-direction: row; } }

        .scoutx-comp-search-row { display: flex; align-items: center; gap: 1rem; width: 100%; flex: 1; position: relative; }
        .scoutx-comp-search-box { flex: 1; background-color: #111111; border: 1px solid #333333; border-radius: 0.375rem; height: 42px; display: flex; align-items: center; padding: 0 0.75rem; }
        .scoutx-comp-search-box input { width: 100%; background: transparent; border: none; color: #FFFFFF; font-size: 14px; outline: none; }
        .scoutx-comp-vs { font-family: 'Plus Jakarta Sans', sans-serif; color: #5DFF31; font-size: 20px; font-weight: 700; }

        .scoutx-comp-search-results { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #1A1A1A; border: 1px solid #333; border-radius: 0.375rem; z-index: 50; overflow: hidden; }
        .scoutx-comp-search-result-item { width: 100%; text-align: left; padding: 0.75rem 1rem; background: transparent; border: none; border-bottom: 1px solid #333; color: #FFF; font-size: 13px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
        .scoutx-comp-search-result-item:hover { background: #222; }

        .scoutx-comp-filters { display: flex; background-color: #111111; border-radius: 0.375rem; border: 1px solid #333333; padding: 0.25rem; }
        .scoutx-comp-filter-btn { padding: 0.375rem 1rem; border-radius: 0.25rem; font-family: 'Space Grotesk', sans-serif; font-size: 10px; letter-spacing: 0.1em; color: #999999; background: transparent; border: none; cursor: pointer; transition: all 0.2s; }
        .scoutx-comp-filter-btn:hover { color: #FFFFFF; }
        .scoutx-comp-filter-btn.active { background-color: #5DFF31; color: #000000; box-shadow: 0 0 10px rgba(93, 255, 49, 0.3); }

        .scoutx-comp-table-card { background-color: #111111; border: 1px solid #333333; border-radius: 0.75rem; display: flex; flex-direction: column; overflow: hidden; }

        .scoutx-comp-grid { display: grid; grid-template-columns: 1fr 2fr 2fr; border-bottom: 1px solid #333333; }

        .scoutx-comp-th { padding: 1.5rem; font-family: 'Space Grotesk', sans-serif; font-size: 11px; color: #999999; letter-spacing: 0.1em; display: flex; align-items: center; }
        .scoutx-comp-th-player { padding: 1.5rem; display: flex; flex-direction: column; border-left: 1px solid #333333; position: relative; }
        .scoutx-comp-glow-top { position: absolute; top: 0; right: 0; left: 0; height: 4px; background-color: rgba(93, 255, 49, 0.2); filter: blur(2px); }
        .scoutx-comp-player-name { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; color: #FFFFFF; font-weight: 700; display: flex; align-items: center; justify-content: space-between; }
        .scoutx-comp-player-ovr { font-family: 'Space Grotesk', sans-serif; font-size: 11px; margin-top: 0.25rem; letter-spacing: 0.1em; color: #999; }

        .scoutx-comp-section-title { background-color: #1A1A1A; border-bottom: 1px solid #333333; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .scoutx-comp-section-title h3 { font-family: 'Space Grotesk', sans-serif; font-size: 10px; color: #5DFF31; letter-spacing: 0.1em; margin: 0; }

        .scoutx-comp-td-label { padding: 1.5rem; font-family: 'Space Grotesk', sans-serif; font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; }
        .scoutx-comp-td-val { padding: 1.5rem; font-size: 14px; color: #FFFFFF; border-left: 1px solid #333333; display: flex; align-items: center; }
        .scoutx-comp-td-val-large { padding: 1.5rem; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 700; color: #FFFFFF; border-left: 1px solid #333333; display: flex; align-items: center; }
        .scoutx-comp-td-val-large.highlight { color: #5DFF31; }

        .scoutx-comp-bar-container { flex: 1; height: 8px; background-color: #333333; border-radius: 9999px; overflow: hidden; margin-right: 1rem; }
        .scoutx-comp-bar-fill { height: 100%; border-radius: 9999px; }

        .scoutx-comp-banner { background-color: #000000; border: 1px solid rgba(93, 255, 49, 0.5); border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 0 30px rgba(93, 255, 49, 0.15); display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 1.5rem; margin-top: 1rem; }
        @media (min-width: 768px) { .scoutx-comp-banner { flex-direction: row; } }
        .scoutx-comp-banner-left { display: flex; align-items: center; gap: 1.5rem; }
        .scoutx-comp-banner-right { display: flex; align-items: center; gap: 2rem; border-left: 1px solid #333333; padding-left: 2rem; }
        .scoutx-comp-btn { padding: 0.75rem 1.5rem; background-color: #5DFF31; color: #000000; font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; border-radius: 0.25rem; letter-spacing: 0.1em; border: none; cursor: pointer; transition: background-color 0.2s; white-space: nowrap; }
        .scoutx-comp-btn:hover { background-color: #7aff54; }
        
        .scoutx-comp-remove-btn { background: none; border: none; color: #666; cursor: pointer; font-size: 16px; display: flex; align-items: center; padding: 0; }
        .scoutx-comp-remove-btn:hover { color: #ef4444; }
      `}</style>

      <div className="scoutx-comp-bg">
        <div className="scoutx-comp-container">
          
          <header className="scoutx-comp-header">
            <div className="scoutx-comp-search-row">
              <div className="scoutx-comp-search-box">
                <span className="material-symbols-outlined" style={{ color: "#666", marginRight: "8px" }}>search</span>
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder={selectedIds.length >= 2 ? "Maximum 2 players selected" : "Search player to add..."} 
                  disabled={selectedIds.length >= 2}
                />
              </div>
              
              {searchResults.length > 0 && (
                <div className="scoutx-comp-search-results">
                  {searchResults.map((player) => (
                    <button key={player.PlayerID} className="scoutx-comp-search-result-item" onClick={() => addPlayer(player)}>
                      <span style={{ fontWeight: 600 }}>{player.Name}</span>
                      <span style={{ color: "#999", fontSize: "11px" }}>{player.Position} · {player.Club ?? "—"}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="scoutx-comp-filters">
              {["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"].map(pos => (
                <button 
                  key={pos}
                  className={`scoutx-comp-filter-btn ${activePos === pos ? "active" : ""}`}
                  onClick={() => setActivePos(pos)}
                >
                  {pos}
                </button>
              ))}
            </div>
          </header>

          <div className="scoutx-comp-table-card">
            
            <div className="scoutx-comp-grid">
              <div className="scoutx-comp-th">STAT</div>
              <div className="scoutx-comp-th-player">
                {p1 && <div className="scoutx-comp-glow-top"></div>}
                <div className="scoutx-comp-player-name">
                  {p1 ? p1.Name : <span style={{ color: "#666" }}>Waiting for selection...</span>}
                  {p1 && <button className="scoutx-comp-remove-btn" onClick={() => removePlayer(p1.PlayerID)}><span className="material-symbols-outlined">close</span></button>}
                </div>
                {p1 && <div className="scoutx-comp-player-ovr" style={{ color: "#5DFF31" }}>{p1.AverageScore ? Math.round(p1.AverageScore) : "—"} OVR</div>}
              </div>
              <div className="scoutx-comp-th-player">
                <div className="scoutx-comp-player-name">
                  {p2 ? p2.Name : <span style={{ color: "#666" }}>Waiting for selection...</span>}
                  {p2 && <button className="scoutx-comp-remove-btn" onClick={() => removePlayer(p2.PlayerID)}><span className="material-symbols-outlined">close</span></button>}
                </div>
                {p2 && <div className="scoutx-comp-player-ovr" style={{ color: "#999999" }}>{p2.AverageScore ? Math.round(p2.AverageScore) : "—"} OVR</div>}
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              
              <div className="scoutx-comp-section-title"><h3>CORE BIO PROFILE</h3></div>
              <div className="scoutx-comp-grid">
                <div className="scoutx-comp-td-label">Club</div>
                <div className="scoutx-comp-td-val">{p1?.Club || "—"}</div>
                <div className="scoutx-comp-td-val">{p2?.Club || "—"}</div>
              </div>
              <div className="scoutx-comp-grid">
                <div className="scoutx-comp-td-label">Age</div>
                {renderVal(p1, p1?.Age ?? null, getWinner(p1?.Age ?? null, p2?.Age ?? null, false) === 1)}
                {renderVal(p2, p2?.Age ?? null, getWinner(p1?.Age ?? null, p2?.Age ?? null, false) === 2)}
              </div>
              <div className="scoutx-comp-grid">
                <div className="scoutx-comp-td-label">HT/WT</div>
                <div className="scoutx-comp-td-val">{p1 ? `${p1.Height || "—"}cm / ${p1.Weight || "—"}kg` : "—"}</div>
                <div className="scoutx-comp-td-val">{p2 ? `${p2.Height || "—"}cm / ${p2.Weight || "—"}kg` : "—"}</div>
              </div>

              <div className="scoutx-comp-section-title"><h3>KEY PERFORMANCE MATRIX</h3></div>
              <div className="scoutx-comp-grid">
                <div className="scoutx-comp-td-label">Goals</div>
                {renderVal(p1, p1?.TotalGoals ?? null, getWinner(p1?.TotalGoals ?? null, p2?.TotalGoals ?? null) === 1, true)}
                {renderVal(p2, p2?.TotalGoals ?? null, getWinner(p1?.TotalGoals ?? null, p2?.TotalGoals ?? null) === 2, true)}
              </div>
              <div className="scoutx-comp-grid">
                <div className="scoutx-comp-td-label">Assists</div>
                {renderVal(p1, p1?.TotalAssists ?? null, getWinner(p1?.TotalAssists ?? null, p2?.TotalAssists ?? null) === 1, true)}
                {renderVal(p2, p2?.TotalAssists ?? null, getWinner(p1?.TotalAssists ?? null, p2?.TotalAssists ?? null) === 2, true)}
              </div>
              <div className="scoutx-comp-grid">
                <div className="scoutx-comp-td-label">Total Passes</div>
                {renderVal(p1, p1?.TotalPasses ?? null, getWinner(p1?.TotalPasses ?? null, p2?.TotalPasses ?? null) === 1, true)}
                {renderVal(p2, p2?.TotalPasses ?? null, getWinner(p1?.TotalPasses ?? null, p2?.TotalPasses ?? null) === 2, true)}
              </div>

              <div className="scoutx-comp-section-title">
                <h3>POSITIONAL PER MATCH ANALYTICS ({activePos})</h3>
              </div>
              <div className="scoutx-comp-grid">
                <div className="scoutx-comp-td-label">Goals / Match</div>
                {renderVal(p1, p1?.GoalsPerMatch ? parseFloat(p1.GoalsPerMatch.toFixed(2)) : null, getWinner(p1?.GoalsPerMatch ?? null, p2?.GoalsPerMatch ?? null) === 1, true)}
                {renderVal(p2, p2?.GoalsPerMatch ? parseFloat(p2.GoalsPerMatch.toFixed(2)) : null, getWinner(p1?.GoalsPerMatch ?? null, p2?.GoalsPerMatch ?? null) === 2, true)}
              </div>
              <div className="scoutx-comp-grid">
                <div className="scoutx-comp-td-label">Assists / Match</div>
                {renderVal(p1, p1?.AssistsPerMatch ? parseFloat(p1.AssistsPerMatch.toFixed(2)) : null, getWinner(p1?.AssistsPerMatch ?? null, p2?.AssistsPerMatch ?? null) === 1, true)}
                {renderVal(p2, p2?.AssistsPerMatch ? parseFloat(p2.AssistsPerMatch.toFixed(2)) : null, getWinner(p1?.AssistsPerMatch ?? null, p2?.AssistsPerMatch ?? null) === 2, true)}
              </div>

              <div className="scoutx-comp-section-title"><h3>OVERALL EVALUATION</h3></div>
              <div className="scoutx-comp-grid">
                <div className="scoutx-comp-td-label">Avg Rating</div>
                {renderVal(p1, p1?.AvgRating ? parseFloat(p1.AvgRating.toFixed(2)) : null, getWinner(p1?.AvgRating ?? null, p2?.AvgRating ?? null) === 1, true)}
                {renderVal(p2, p2?.AvgRating ? parseFloat(p2.AvgRating.toFixed(2)) : null, getWinner(p1?.AvgRating ?? null, p2?.AvgRating ?? null) === 2, true)}
              </div>
              <div className="scoutx-comp-grid" style={{ borderBottom: "none" }}>
                <div className="scoutx-comp-td-label">Calculated OVR Score</div>
                <div className="scoutx-comp-td-val" style={{ gap: "1rem" }}>
                  {p1 ? (
                    <>
                      <div className="scoutx-comp-bar-container">
                        <div className="scoutx-comp-bar-fill" style={{ backgroundColor: "#5DFF31", width: `${p1.AverageScore || 0}%`, boxShadow: "0 0 10px rgba(93,255,49,0.5)" }}></div>
                      </div>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "16px", fontWeight: 700, color: "#5DFF31" }}>{p1.AverageScore ? Math.round(p1.AverageScore) : "—"}</span>
                    </>
                  ) : "—"}
                </div>
                <div className="scoutx-comp-td-val" style={{ gap: "1rem" }}>
                  {p2 ? (
                    <>
                      <div className="scoutx-comp-bar-container">
                        <div className="scoutx-comp-bar-fill" style={{ backgroundColor: "#999999", width: `${p2.AverageScore || 0}%` }}></div>
                      </div>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "16px", fontWeight: 700, color: "#999999" }}>{p2.AverageScore ? Math.round(p2.AverageScore) : "—"}</span>
                    </>
                  ) : "—"}
                </div>
              </div>

            </div>
          </div>

          {overallWinner && p1 && p2 && (
            <div className="scoutx-comp-banner">
              <div className="scoutx-comp-banner-left">
                <span className="material-symbols-outlined" style={{ color: "#F5B041", fontSize: "40px" }}>emoji_events</span>
                <div>
                  <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "10px", color: "#5DFF31", letterSpacing: "0.1em", margin: "0 0 0.25rem 0" }}>
                    TACTICAL INTELLIGENCE RECOMMENDATION
                  </h4>
                  <p style={{ margin: 0, fontSize: "18px" }}>
                    <span style={{ fontWeight: 700 }}>{overallWinner.Name}</span> leads with a comprehensive Tactical OVR of <span style={{ fontWeight: 700 }}>{Math.round(overallWinner.AverageScore || 0)}</span>.
                  </p>
                </div>
              </div>
              <div className="scoutx-comp-banner-right">
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "10px", color: "#999", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>CONFIDENCE SCORE</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "24px", color: "#5DFF31", fontWeight: 700, lineHeight: 1 }}>
                    {Math.round((overallWinner.AverageScore || 0) * 1.1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
