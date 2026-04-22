"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Watchlist = {
  WatchListID: number;
  ListName: string;
  CreatedAt: string;
  PlayerCount: number;
};

export default function WatchlistsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const canManage = userRole === "Coach" || userRole === "Manager" || userRole === "Admin";

  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Watchlist | null>(null);
  const [toast, setToast] = useState({ show: false, message: "", ok: true });

  const showToast = (message: string, ok = true) => {
    setToast({ show: true, message, ok });
    setTimeout(() => setToast({ show: false, message: "", ok: true }), 3000);
  };

  const fetchWatchlists = async () => {
    setLoading(true);
    const res = await fetch("/api/watchlists");
    if (res.ok) setWatchlists(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchWatchlists(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    const res = await fetch("/api/watchlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listName: newName }),
    });

    const data = await res.json();
    if (!res.ok) {
      setCreateError(data.error || "Failed to create watchlist.");
    } else {
      setShowCreate(false);
      setNewName("");
      showToast("Watchlist created!");
      fetchWatchlists();
    }
    setCreating(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/watchlists/${deleteTarget.WatchListID}`, { method: "DELETE" });
    setDeleteTarget(null);
    if (res.ok) { showToast("Watchlist deleted."); fetchWatchlists(); }
    else showToast("Failed to delete.", false);
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

      {/* Toast */}
      {toast.show && (
        <div style={{
          position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999,
          padding: "0.875rem 1.25rem", borderRadius: "var(--radius-md)",
          background: toast.ok ? "var(--success)" : "var(--danger)",
          color: "white", fontWeight: 600, boxShadow: "var(--shadow-lg)",
        }}>
          {toast.ok ? "✓" : "✗"} {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>My Watchlists</h1>
          <p>{watchlists.length} watchlist{watchlists.length !== 1 ? "s" : ""}</p>
        </div>
        {canManage && (
          <button id="btn-create-watchlist" className="btn btn-primary"
            onClick={() => { setShowCreate(true); setCreateError(""); setNewName(""); }}>
            + New Watchlist
          </button>
        )}
      </div>

      {/* Watchlist Cards */}
      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          Loading watchlists...
        </div>
      ) : watchlists.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📋</div>
          <h3 style={{ marginBottom: "0.5rem" }}>No watchlists yet</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            {canManage
              ? "Create a watchlist and start bookmarking players you're interested in."
              : "No watchlists have been shared with you yet."}
          </p>
          {canManage && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              Create First Watchlist
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {watchlists.map((wl) => (
            <div key={wl.WatchListID} className="card animate-fade-in" style={{
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              transition: "transform 0.2s ease",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>📋</div>
                <h3 style={{ marginBottom: "0.25rem", color: "var(--text-primary)" }}>{wl.ListName}</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  {wl.PlayerCount} player{wl.PlayerCount !== 1 ? "s" : ""} &nbsp;·&nbsp;{" "}
                  Created {new Date(wl.CreatedAt).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link
                  href={`/watchlists/${wl.WatchListID}`}
                  id={`btn-view-watchlist-${wl.WatchListID}`}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center", fontSize: "0.875rem" }}
                >
                  View
                </Link>
                {canManage && (
                  <button
                    id={`btn-delete-watchlist-${wl.WatchListID}`}
                    className="btn btn-danger"
                    style={{ padding: "0.5rem 0.875rem", fontSize: "0.875rem" }}
                    onClick={() => setDeleteTarget(wl)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "400px" }}>
            <h3 style={{ marginBottom: "1.25rem" }}>Create Watchlist</h3>
            {createError && (
              <div style={{
                padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1rem",
                background: "rgba(239,68,68,0.15)", color: "var(--danger)", fontSize: "0.875rem",
              }}>
                {createError}
              </div>
            )}
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="label">Watchlist Name</label>
                <input id="input-watchlist-name" type="text" required className="input"
                  placeholder="e.g. Premier League Prospects"
                  value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="submit" id="btn-confirm-create" className="btn btn-primary"
                  disabled={creating} style={{ flex: 1 }}>
                  {creating ? "Creating..." : "Create"}
                </button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                  onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "380px", textAlign: "center" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>Delete Watchlist?</h3>
            <p style={{ marginBottom: "1.5rem", color: "var(--text-muted)" }}>
              "<strong style={{ color: "var(--text-primary)" }}>{deleteTarget.ListName}</strong>" will be
              permanently deleted along with its {deleteTarget.PlayerCount} player{deleteTarget.PlayerCount !== 1 ? "s" : ""}.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button id="btn-confirm-delete" className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>
                Yes, Delete
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
