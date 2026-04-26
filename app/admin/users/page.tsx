"use client";

import { useState, useEffect } from "react";

type User = {
  UserID: number;
  Name: string;
  Email: string;
  Role: string;
  CreatedAt: string;
};

type ModalMode = "create" | "edit" | null;

const ROLES = ["Admin", "Scout", "Coach", "Manager"];

const ROLE_BADGE: Record<string, string> = {
  Admin: "badge-danger",
  Scout: "badge-primary",
  Coach: "badge-success",
  Manager: "badge-warning",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", ok: true });

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("Scout");
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message: string, ok = true) => {
    setToast({ show: true, message, ok });
    setTimeout(() => setToast({ show: false, message: "", ok: true }), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setFormName(""); setFormEmail(""); setFormPassword(""); setFormRole("Scout");
    setFormError("");
    setSelectedUser(null);
    setModalMode("create");
  };

  const openEdit = (user: User) => {
    setFormName(user.Name); setFormEmail(user.Email); setFormPassword(""); setFormRole(user.Role);
    setFormError("");
    setSelectedUser(user);
    setModalMode("edit");
  };

  const closeModal = () => { setModalMode(null); setSelectedUser(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    const payload: any = { name: formName, email: formEmail, role: formRole };
    if (modalMode === "create") payload.password = formPassword;
    if (modalMode === "edit" && formPassword) payload.password = formPassword;

    const url = modalMode === "edit" ? `/api/users/${selectedUser!.UserID}` : "/api/users";
    const method = modalMode === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setFormError(data.error || "Something went wrong.");
    } else {
      closeModal();
      await fetchUsers();
      showToast(modalMode === "create" ? "User created successfully!" : "User updated successfully!");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/users/${deleteTarget.UserID}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteTarget(null);
      await fetchUsers();
      showToast("User deleted.", true);
    } else {
      showToast("Failed to delete user.", false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>

      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 9999,
          padding: "0.875rem 1.25rem", borderRadius: "var(--radius-md)",
          background: toast.ok ? "var(--success)" : "var(--danger)",
          color: "white", fontWeight: 600, boxShadow: "var(--shadow-lg)",
          animation: "fadeIn 0.3s ease",
        }}>
          {toast.ok ? "✓" : "✗"} {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>User Management</h1>
          <p>Add, edit or remove Scouts, Coaches and Managers.</p>
        </div>
        <button id="btn-create-user" className="btn btn-primary" onClick={openCreate}>
          + Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
            Loading users...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
                    No users found. Click "+ Add User" to create one.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.UserID} className="animate-fade-in">
                    <td style={{ color: "var(--color-text-muted)" }}>{user.UserID}</td>
                    <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{user.Name}</td>
                    <td>{user.Email}</td>
                    <td>
                      <span className={`badge ${ROLE_BADGE[user.Role] || "badge-primary"}`}>
                        {user.Role}
                      </span>
                    </td>
                    <td>{new Date(user.CreatedAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          id={`btn-edit-user-${user.UserID}`}
                          className="btn btn-secondary"
                          style={{ padding: "0.375rem 0.75rem", fontSize: "0.8rem" }}
                          onClick={() => openEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          id={`btn-delete-user-${user.UserID}`}
                          className="btn btn-danger"
                          style={{ padding: "0.375rem 0.75rem", fontSize: "0.8rem" }}
                          onClick={() => setDeleteTarget(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalMode && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "440px" }}>
            <h3 style={{ marginBottom: "1.25rem" }}>
              {modalMode === "create" ? "Create New User" : `Edit — ${selectedUser?.Name}`}
            </h3>

            {formError && (
              <div style={{
                padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1rem",
                background: "rgba(239,68,68,0.15)", color: "var(--danger)", fontSize: "0.875rem",
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="label">Full Name</label>
                <input id="input-user-name" type="text" required className="input"
                  placeholder="Muhammad Ali" value={formName}
                  onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input id="input-user-email" type="email" required className="input"
                  placeholder="user@scoutx.com" value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div>
                <label className="label">
                  {modalMode === "edit" ? "New Password (leave blank to keep current)" : "Password"}
                </label>
                <input id="input-user-password" type="password"
                  required={modalMode === "create"} className="input"
                  placeholder="••••••••" value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)} />
              </div>
              <div>
                <label className="label">Role</label>
                <select id="input-user-role" className="select" value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="submit" id="btn-submit-user" className="btn btn-primary"
                  disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? "Saving..." : modalMode === "create" ? "Create User" : "Save Changes"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}
                  style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "380px", textAlign: "center" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>Delete User?</h3>
            <p style={{ marginBottom: "1.5rem" }}>
              Are you sure you want to delete <strong style={{ color: "var(--color-text-primary)" }}>
              {deleteTarget.Name}</strong>? This cannot be undone.
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
