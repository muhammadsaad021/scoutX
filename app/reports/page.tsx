"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { generatePlayerReportPDF } from "@/lib/pdf-generator";
import { useReports } from "../../hooks/useReports";
import { usePlayerSearch } from "../../hooks/usePlayerSearch";
import { useToast } from "../../hooks/useToast";
import { generateReportAPI } from "../../services/reportService";
import { SearchResult } from "../../types/player";

export default function ReportsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const canGenerate = ["Scout", "Coach", "Manager", "Admin"].includes(userRole);

  const { reports, loading, refreshReports } = useReports();
  const { toast, showToast } = useToast();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const { searchResults, isSearching, clearSearch } = usePlayerSearch(searchQuery);
  const [generatingFor, setGeneratingFor] = useState<number | null>(null);

  const handleGenerateReport = async (player: SearchResult) => {
    setGeneratingFor(player.PlayerID);
    setSearchQuery("");
    clearSearch();

    try {
      const data = await generateReportAPI(player.PlayerID);
      // Use client-side jsPDF to generate the document
      generatePlayerReportPDF(data.player);
      showToast("Report generated successfully!");
      refreshReports(); // Refresh history
    } catch (err: any) {
      showToast(err.message || "An error occurred during generation.", false);
    } finally {
      setGeneratingFor(null);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

      {/* Toast */}
      {toast.show && (
        <div style={{
          position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999,
          padding: "0.875rem 1.25rem", borderRadius: "var(--radius-md)",
          background: toast.ok ? "var(--color-primary)" : "var(--color-danger)",
          color: toast.ok ? "var(--color-on-primary)" : "white", fontWeight: 600, boxShadow: "var(--shadow-lg)",
        }}>
          {toast.ok ? "✓" : "✗"} {toast.message}
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>Scout Reports</h1>
        <p>Generate and view history of player dossiers.</p>
      </div>

      {canGenerate && (
        <div className="card animate-fade-in" style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Generate New Report (PDF)</h3>
          <div style={{ position: "relative", maxWidth: "500px" }}>
            <input
              id="input-report-search"
              type="text"
              className="input"
              placeholder="Search player to generate report..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
                background: "var(--color-bg-card)", border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", overflow: "hidden",
              }}>
                {searchResults.map((p) => (
                  <button
                    key={p.PlayerID}
                    id={`btn-generate-${p.PlayerID}`}
                    onClick={() => handleGenerateReport(p)}
                    disabled={generatingFor === p.PlayerID}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      width: "100%", padding: "0.75rem 1rem", background: "none", border: "none",
                      borderBottom: "1px solid var(--color-border)", cursor: "pointer",
                      color: "var(--color-text-primary)", textAlign: "left", transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-surface)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <span style={{ fontWeight: 600 }}>{p.Name}</span>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                      {p.Position} · {p.Club ?? "—"}
                      {generatingFor === p.PlayerID && " — Generating..."}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report History */}
      <h3 style={{ marginBottom: "1rem" }}>Report History</h3>
      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
          Loading history...
        </div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
          No reports generated yet.
        </div>
      ) : (
        <div className="table-container animate-fade-in">
          <table>
            <thead>
              <tr>
                <th>Date Generated</th>
                <th>Player</th>
                <th>Position</th>
                <th>Format</th>
                <th>Generated By</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.ReportID}>
                  <td>{new Date(report.GeneratedDate).toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {report.Players?.Name ?? "Unknown Player"}
                  </td>
                  <td>{report.Players?.Position ?? "—"}</td>
                  <td>
                    <span className="badge badge-primary">{report.Format}</span>
                  </td>
                  <td style={{ color: "var(--color-text-muted)" }}>{report.Users?.Name ?? "Unknown User"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
