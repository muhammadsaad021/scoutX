"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useWatchlists } from "../../hooks/useWatchlists";
import { useToast } from "../../hooks/useToast";
import { Watchlist } from "../../types/watchlist";

export default function WatchlistsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const canManage = ["Coach", "Manager", "Admin"].includes(userRole);

  const { watchlists, loading, createWatchlist, deleteWatchlist } = useWatchlists();

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Watchlist | null>(null);
  const { toast, showToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    try {
      await createWatchlist(newName);
      setShowCreate(false);
      setNewName("");
      showToast("Watchlist created!");
    } catch (err: any) {
      setCreateError(err.message || "Failed to create watchlist.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteWatchlist(deleteTarget.WatchListID);
      setDeleteTarget(null);
      showToast("Watchlist deleted.");
    } catch (err) {
      showToast("Failed to delete.", false);
    }
  };

  return (
    <>
      <style>{`
        .scoutx-wl-bg { background-color: var(--color-bg-body); min-height: 100vh; padding: var(--space-2xl); width: 100%; color: var(--color-text-primary); font-family: var(--font-body); }
        .scoutx-wl-container { max-width: 1200px; margin: 0 auto; }
        .scoutx-wl-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; flex-wrap: wrap; gap: 1rem; }
        .scoutx-wl-title { font-family: var(--font-heading); font-size: var(--text-5xl); font-weight: var(--fw-bold); color: var(--color-text-primary); margin: 0; line-height: var(--lh-tight); letter-spacing: var(--ls-tight); }
        .scoutx-wl-subtitle { color: var(--color-text-ghost); font-size: var(--text-sm); font-weight: var(--fw-semibold); text-transform: uppercase; letter-spacing: var(--ls-widest); margin: 0.5rem 0 0 0; font-family: var(--font-mono); }

        .scoutx-wl-btn-new {
          background-color: var(--color-primary); color: var(--color-on-primary); font-family: var(--font-mono);
          font-size: var(--text-sm); font-weight: var(--fw-semibold); padding: var(--space-lg) var(--space-lg); text-transform: uppercase;
          letter-spacing: var(--ls-widest); border: none; cursor: pointer; transition: all var(--transition-normal);
        }
        .scoutx-wl-btn-new:hover { box-shadow: var(--shadow-glow-xl); }

        .scoutx-wl-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 1.5rem; }
        @media (min-width: 768px) { .scoutx-wl-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .scoutx-wl-grid { grid-template-columns: repeat(3, 1fr); } }

        .scoutx-wl-card {
          background-color: rgba(24, 24, 27, 0.4); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.5rem; transition: all 0.3s; position: relative;
        }
        .scoutx-wl-card:hover { border-color: rgba(93, 255, 49, 0.5); }

        .scoutx-wl-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        .scoutx-wl-icon-box {
          width: 3rem; height: 3rem; background-color: rgba(39, 39, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex; justify-content: center; align-items: center; color: #5DFF31;
        }
        .scoutx-wl-dots { display: flex; gap: 4px; }
        .scoutx-wl-dot-active { width: 6px; height: 6px; border-radius: 50%; background-color: #5DFF31; }
        .scoutx-wl-dot-inactive { width: 6px; height: 6px; border-radius: 50%; background-color: #3f3f46; }

        .scoutx-wl-card-title { font-family: var(--font-heading); font-size: var(--text-xl); font-weight: var(--fw-bold); color: var(--color-text-primary); margin: 0 0 0.5rem 0; letter-spacing: -0.01em; text-transform: uppercase; }
        .scoutx-wl-meta { display: flex; align-items: center; gap: 0.5rem; color: #71717a; font-size: 0.875rem; margin-bottom: 0.5rem; }
        .scoutx-wl-meta .material-symbols-outlined { font-size: 16px; }

        .scoutx-wl-actions { display: flex; gap: 0.75rem; margin-top: 2rem; }
        .scoutx-wl-btn-view {
          flex: 1; background-color: var(--color-primary); color: var(--color-on-primary); font-family: var(--font-mono); text-decoration: none;
          font-size: 10px; padding: 0.625rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600; text-align: center;
          transition: all 0.2s; border: none; cursor: pointer; display: flex; justify-content: center; align-items: center;
        }
        .scoutx-wl-btn-view:hover { filter: brightness(1.1); }
        .scoutx-wl-btn-delete {
          padding: 0 1rem; border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; background: transparent;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
        }
        .scoutx-wl-btn-delete:hover { background-color: rgba(239, 68, 68, 0.1); }

        .scoutx-wl-empty {
          border: 1px dashed rgba(255, 255, 255, 0.1); display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 1.5rem; color: #52525b; transition: all 0.2s; cursor: pointer; background-color: rgba(9, 9, 11, 0.2); min-height: 250px;
        }
        .scoutx-wl-empty:hover { border-color: rgba(93, 255, 49, 0.3); color: #a1a1aa; }
        .scoutx-wl-empty-text { font-family: 'Space Grotesk', sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 600; }

        .scoutx-wl-grid-hint { margin-top: 6rem; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 3rem; }
        .scoutx-wl-grid-lines { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; opacity: 0.2; }
        .scoutx-wl-grid-line-active { height: 4px; background-color: #5DFF31; }
        .scoutx-wl-grid-line { height: 4px; background-color: #27272a; }
        .scoutx-wl-system-status { display: flex; justify-content: space-between; margin-top: 1rem; }
        .scoutx-wl-system-text { font-family: 'Space Grotesk', sans-serif; font-size: 8px; color: #52525b; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600; }

        .scoutx-toast {
          position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999;
          padding: 0.875rem 1.25rem; border-radius: 0.25rem;
          color: white; font-weight: var(--fw-semibold); font-family: var(--font-body); font-size: var(--text-base);
        }

        .scoutx-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .scoutx-modal {
          background: #111; border: 1px solid #222; padding: 2rem; width: 100%; max-width: 400px;
        }
        .scoutx-modal h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 1.5rem; color: #fff; margin: 0 0 1.5rem 0; }
        .scoutx-modal p { color: #888; margin: 0 0 2rem 0; font-size: 0.875rem; }
        .scoutx-modal-input { width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 0.75rem; font-family: 'Inter', sans-serif; outline: none; margin-bottom: 1.5rem; }
        .scoutx-modal-input:focus { border-color: #5DFF31; }
        .scoutx-modal-btns { display: flex; gap: 1rem; }
        .scoutx-modal-btn { flex: 1; padding: 0.75rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; font-family: 'Space Grotesk', sans-serif; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; }
        .scoutx-modal-btn-primary { background: #5DFF31; color: #000; }
        .scoutx-modal-btn-primary:hover { filter: brightness(1.1); }
        .scoutx-modal-btn-danger { background: transparent; border: 1px solid #ef4444; color: #ef4444; }
        .scoutx-modal-btn-danger:hover { background: rgba(239, 68, 68, 0.1); }
        .scoutx-modal-btn-cancel { background: #222; color: #fff; }
        .scoutx-modal-btn-cancel:hover { background: #333; }
      `}</style>

      <div className="scoutx-wl-bg">
        <div className="scoutx-wl-container">
          {/* Toast */}
          {toast.show && (
            <div className="scoutx-toast" style={{ background: toast.ok ? "var(--success)" : "var(--danger)" }}>
              {toast.ok ? "✓" : "✗"} {toast.message}
            </div>
          )}

          {/* Header */}
          <div className="scoutx-wl-header">
            <div>
              <h2 className="scoutx-wl-title">My Watchlists</h2>
              <p className="scoutx-wl-subtitle">{watchlists.length} watchlist{watchlists.length !== 1 ? "s" : ""} active</p>
            </div>
            {canManage && (
              <button className="scoutx-wl-btn-new" onClick={() => { setShowCreate(true); setCreateError(""); setNewName(""); }}>
                + New Watchlist
              </button>
            )}
          </div>

          {/* Watchlists Grid */}
          <div className="scoutx-wl-grid">
            {loading ? (
              <div style={{ color: "#71717a", fontFamily: "'Space Grotesk', sans-serif", fontSize: "12px", textTransform: "uppercase", gridColumn: "1 / -1", padding: "3rem 0" }}>
                Loading watchlists...
              </div>
            ) : watchlists.map((wl) => (
              <div key={wl.WatchListID} className="scoutx-wl-card">
                <div className="scoutx-wl-card-header">
                  <div className="scoutx-wl-icon-box">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div className="scoutx-wl-dots">
                    <div className="scoutx-wl-dot-active"></div>
                    <div className="scoutx-wl-dot-inactive"></div>
                  </div>
                </div>
                <h3 className="scoutx-wl-card-title">{wl.ListName}</h3>
                <div style={{ marginBottom: "2rem" }}>
                  <div className="scoutx-wl-meta">
                    <span className="material-symbols-outlined">person</span>
                    <span>{wl.PlayerCount} Players</span>
                  </div>
                  <div className="scoutx-wl-meta">
                    <span className="material-symbols-outlined">calendar_today</span>
                    <span>Created {new Date(wl.CreatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="scoutx-wl-actions">
                  <Link href={`/watchlists/${wl.WatchListID}`} className="scoutx-wl-btn-view">
                    View
                  </Link>
                  {canManage && (
                    <button className="scoutx-wl-btn-delete" onClick={() => setDeleteTarget(wl)}>
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Empty State / Add New Placeholder */}
            {!loading && canManage && (
              <div className="scoutx-wl-empty" onClick={() => setShowCreate(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: "32px", marginBottom: "1rem" }}>add_circle</span>
                <span className="scoutx-wl-empty-text">New Watchlist</span>
              </div>
            )}
          </div>

          {/* Decorative Technical Grid Overlay Hint */}
          <div className="scoutx-wl-grid-hint">
            <div className="scoutx-wl-grid-lines">
              <div className="scoutx-wl-grid-line-active"></div>
              <div className="scoutx-wl-grid-line"></div>
              <div className="scoutx-wl-grid-line"></div>
              <div className="scoutx-wl-grid-line"></div>
            </div>
            <div className="scoutx-wl-system-status">
              <p className="scoutx-wl-system-text">System Status: Optim</p>
              <p className="scoutx-wl-system-text">Ref: SX-WL-9920</p>
            </div>
          </div>

        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="scoutx-modal-overlay">
          <div className="scoutx-modal">
            <h3>Create Watchlist</h3>
            {createError && (
              <div style={{ padding: "0.75rem", borderRadius: "4px", marginBottom: "1rem", background: "rgba(239,68,68,0.15)", color: "#ef4444", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" }}>
                {createError}
              </div>
            )}
            <form onSubmit={handleCreate}>
              <div>
                <input type="text" required className="scoutx-modal-input"
                  placeholder="E.G. PREMIER LEAGUE PROSPECTS"
                  value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div className="scoutx-modal-btns">
                <button type="submit" className="scoutx-modal-btn scoutx-modal-btn-primary" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </button>
                <button type="button" className="scoutx-modal-btn scoutx-modal-btn-cancel" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="scoutx-modal-overlay">
          <div className="scoutx-modal" style={{ textAlign: "center" }}>
            <h3>Terminate Watchlist?</h3>
            <p>
              Are you sure you want to permanently delete <strong style={{ color: "#fff" }}>{deleteTarget.ListName}</strong>? This will remove all {deleteTarget.PlayerCount} tracked players.
            </p>
            <div className="scoutx-modal-btns">
              <button className="scoutx-modal-btn scoutx-modal-btn-danger" onClick={handleDelete}>
                Confirm Purge
              </button>
              <button className="scoutx-modal-btn scoutx-modal-btn-cancel" onClick={() => setDeleteTarget(null)}>
                Abort
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
