"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("Manager"); // Changed default to "Manager" to match UI
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Send to our user creation endpoint
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const RoleBox = ({ rTitle, icon }: { rTitle: string, icon: string }) => {
    const isSelected = role === rTitle;
    return (
      <button
        type="button"
        onClick={() => setRole(rTitle)}
        className={`scoutx-role-card ${isSelected ? 'active' : ''}`}
      >
        <span className="scoutx-role-icon">{icon}</span>
        <span className="scoutx-role-title">{rTitle}</span>
      </button>
    );
  };

  return (
    <>
      <style>{`
        .scoutx-page {
          background-color: var(--color-bg-card);
          color: var(--color-text-secondary);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: var(--font-body);
          position: relative;
          -webkit-font-smoothing: antialiased;
        }
        .scoutx-page::selection, .scoutx-page *::selection {
          background-color: var(--color-primary);
          color: var(--color-on-primary);
        }

        .scoutx-bg-effect {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.2;
          background: radial-gradient(circle at top right, rgba(93, 255, 49, 0.15), transparent 40%), 
                      radial-gradient(circle at bottom left, rgba(93, 255, 49, 0.05), transparent 30%);
        }

        .scoutx-header {
          position: relative;
          z-index: 10;
          width: 100%;
          padding: var(--space-xl);
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }

        .scoutx-logo {
          color: var(--color-primary);
          font-family: var(--font-heading);
          font-size: var(--text-2xl);
          letter-spacing: -1px;
          font-weight: var(--fw-black);
        }

        .scoutx-main {
          position: relative;
          z-index: 10;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-3xl) var(--space-md);
        }

        .scoutx-container {
          width: 100%;
          max-width: 42rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .scoutx-heading-sub {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: var(--space-md);
          display: block;
        }

        .scoutx-heading-main {
          font-family: var(--font-heading);
          font-size: var(--text-5xl);
          color: var(--color-text-primary);
          line-height: var(--lh-tight);
          font-weight: var(--fw-bold);
          margin: 0;
        }

        .scoutx-role-section {
          width: 100%;
          margin-bottom: var(--space-2xl);
        }

        .scoutx-label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--color-text-ghost);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: var(--space-sm);
          display: block;
          transition: color 0.2s;
        }

        .scoutx-role-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-lg);
        }

        .scoutx-role-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg) var(--space-md);
          border-radius: var(--radius-sm);
          transition: all var(--transition-normal);
          cursor: pointer;
          background-color: var(--color-bg-card-hover);
          border: 1px solid var(--color-border-subtle);
          outline: none;
        }
        .scoutx-role-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }
        .scoutx-role-card.active {
          background-color: var(--color-bg-surface);
          border-color: rgba(93, 255, 49, 0.5);
          box-shadow: 0 0 15px rgba(93, 255, 49, 0.1);
        }

        .scoutx-role-icon {
          font-family: 'Material Symbols Outlined';
          margin-bottom: var(--space-lg);
          font-size: 30px;
          font-weight: 300;
          transition: color 0.2s;
          color: var(--color-text-muted);
          font-variation-settings: 'FILL' 0;
        }
        .scoutx-role-card:hover .scoutx-role-icon {
          color: var(--color-text-primary);
        }
        .scoutx-role-card.active .scoutx-role-icon {
          color: var(--color-primary);
        }

        .scoutx-role-title {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          transition: color var(--transition-normal);
          color: var(--color-text-ghost);
        }
        .scoutx-role-card:hover .scoutx-role-title {
          color: var(--color-text-primary);
        }
        .scoutx-role-card.active .scoutx-role-title {
          color: var(--color-primary);
        }

        .scoutx-form {
          width: 100%;
        }

        .scoutx-input-group {
          position: relative;
          margin-bottom: var(--space-xl);
        }
        .scoutx-input-group:focus-within .scoutx-label {
          color: var(--color-primary);
        }

        .scoutx-input {
          display: block;
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--color-border-subtle);
          padding: var(--space-lg) 0;
          color: var(--color-text-primary);
          font-family: var(--font-body);
          font-size: 16px;
          transition: border-color var(--transition-normal);
          outline: none;
        }
        .scoutx-input::placeholder {
          color: var(--color-text-dim);
        }
        .scoutx-input:focus {
          border-bottom-color: var(--color-primary);
        }
        .scoutx-input[type="password"] {
          letter-spacing: 0.2em;
        }

        .scoutx-submit-btn {
          width: 100%;
          background-color: var(--color-primary);
          color: var(--color-on-primary);
          font-family: var(--font-heading);
          font-size: var(--text-md);
          font-weight: var(--fw-extrabold);
          text-transform: uppercase;
          letter-spacing: var(--ls-wider);
          padding: var(--space-md);
          border-radius: 0.25rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 0 20px rgba(93, 255, 49, 0.2);
          margin-top: var(--space-md);
        }
        .scoutx-submit-btn:hover:not(:disabled) {
          background-color: var(--color-primary-hover);
          box-shadow: var(--shadow-glow-xl);
        }
        .scoutx-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .scoutx-footer-link {
          margin-top: var(--space-xl);
          text-align: center;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--space-sm);
        }
        .scoutx-footer-text {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .scoutx-link {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-decoration: none;
          transition: color 0.2s;
        }
        .scoutx-link:hover {
          color: var(--color-text-primary);
        }

        .scoutx-footer {
          position: relative;
          z-index: 10;
          width: 100%;
          padding: var(--space-lg) var(--space-xl);
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .scoutx-copyright {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--color-text-ghost);
          letter-spacing: var(--ls-wider);
        }
      `}</style>

      <div className="scoutx-page">
        <div className="scoutx-bg-effect"></div>

        <header className="scoutx-header">
          <div className="scoutx-logo">scoutX</div>
        </header>

        <main className="scoutx-main">
          <div className="scoutx-container">
            
            <div style={{ marginBottom: "2.5rem", width: "100%" }}>
              <span className="scoutx-heading-sub">SIGN UP</span>
              <h1 className="scoutx-heading-main">Create Your Professional<br/>Scouting Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className="scoutx-form">
              <div className="scoutx-role-section">
                <span className="scoutx-label" style={{ marginBottom: "1rem" }}>DESIGNATE OPERATIVE ROLE</span>
                <div className="scoutx-role-grid">
                  <RoleBox rTitle="Manager" icon="business_center" />
                  <RoleBox rTitle="Scout" icon="visibility" />
                  <RoleBox rTitle="Admin" icon="settings" />
                </div>
              </div>

              {error && <div style={{ color: "var(--color-danger)", fontSize: "var(--text-base)", marginBottom: "var(--space-lg)" }}>{error}</div>}

              <div className="scoutx-input-group">
                <label className="scoutx-label" htmlFor="fullName">FULL NAME</label>
                <input 
                  id="fullName"
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="TROJAN" 
                  className="scoutx-input" 
                />
              </div>

              <div className="scoutx-input-group">
                <label className="scoutx-label" htmlFor="email">EMAIL ADDRESS</label>
                <input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="trojan@scoutx.com" 
                  className="scoutx-input" 
                />
              </div>



              <div className="scoutx-input-group">
                <label className="scoutx-label" htmlFor="password">PASSWORD</label>
                <input 
                  id="password"
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="•••••••••••" 
                  className="scoutx-input" 
                />
              </div>

              <div style={{ paddingTop: "1rem" }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="scoutx-submit-btn"
                >
                  {loading ? "REGISTERING..." : "REGISTER"}
                </button>
              </div>
            </form>

            <div className="scoutx-footer-link">
              <span className="scoutx-footer-text">ALREADY HAVE AN ACCOUNT?</span>
              <Link href="/login" className="scoutx-link">
                LOGIN
              </Link>
            </div>
            
          </div>
        </main>
        
        <footer className="scoutx-footer">
          <div className="scoutx-copyright">
            © 2024 SCOUTX. ALL RIGHTS RESERVED.
          </div>
        </footer>
      </div>
    </>
  );
}
