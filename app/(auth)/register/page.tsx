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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        :root {
          --bg-main: #111111;
          --text-main: #e5e2e1;
          --text-white: #ffffff;
          --text-muted: #bbcbb0;
          --primary: #5DFF31;
          --primary-hover: #3fe405;
          --bg-card-active: #1a1a1a;
          --bg-card: #151515;
          --border-light: rgba(255, 255, 255, 0.1);
          --border-lighter: rgba(255, 255, 255, 0.2);
          --border-primary-dim: rgba(93, 255, 49, 0.5);
          
          --font-body: 'Inter', sans-serif;
          --font-head: 'Plus Jakarta Sans', sans-serif;
          --font-mono: 'Space Grotesk', sans-serif;
        }

        .scoutx-page {
          background-color: var(--bg-main);
          color: var(--text-main);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: var(--font-body);
          position: relative;
          -webkit-font-smoothing: antialiased;
        }
        .scoutx-page::selection, .scoutx-page *::selection {
          background-color: var(--primary);
          color: #1a7200;
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
          padding: 2rem;
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }

        .scoutx-logo {
          color: var(--primary);
          font-family: var(--font-head);
          font-size: 24px;
          letter-spacing: -1px;
          font-weight: 900;
        }

        .scoutx-main {
          position: relative;
          z-index: 10;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
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
          font-size: 10px;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 1rem;
          display: block;
        }

        .scoutx-heading-main {
          font-family: var(--font-head);
          font-size: 48px;
          color: var(--text-white);
          line-height: 1.1;
          font-weight: 700;
          margin: 0;
        }

        .scoutx-role-section {
          width: 100%;
          margin-bottom: 2.5rem;
        }

        .scoutx-label {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 0.5rem;
          display: block;
          transition: color 0.2s;
        }

        .scoutx-role-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .scoutx-role-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem;
          border-radius: 0.25rem;
          transition: all 0.2s;
          cursor: pointer;
          background-color: var(--bg-card);
          border: 1px solid var(--border-light);
          outline: none;
        }
        .scoutx-role-card:hover {
          border-color: var(--border-lighter);
        }
        .scoutx-role-card.active {
          background-color: var(--bg-card-active);
          border-color: var(--border-primary-dim);
          box-shadow: 0 0 15px rgba(93, 255, 49, 0.1);
        }

        .scoutx-role-icon {
          font-family: 'Material Symbols Outlined';
          margin-bottom: 0.75rem;
          font-size: 30px;
          font-weight: 300;
          transition: color 0.2s;
          color: var(--text-muted);
          font-variation-settings: 'FILL' 0;
        }
        .scoutx-role-card:hover .scoutx-role-icon {
          color: var(--text-white);
        }
        .scoutx-role-card.active .scoutx-role-icon {
          color: var(--primary);
        }

        .scoutx-role-title {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          transition: color 0.2s;
          color: var(--text-muted);
        }
        .scoutx-role-card:hover .scoutx-role-title {
          color: var(--text-white);
        }
        .scoutx-role-card.active .scoutx-role-title {
          color: var(--primary);
        }

        .scoutx-form {
          width: 100%;
        }

        .scoutx-input-group {
          position: relative;
          margin-bottom: 2rem;
        }
        .scoutx-input-group:focus-within .scoutx-label {
          color: var(--primary);
        }

        .scoutx-input {
          display: block;
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border-light);
          padding: 0.75rem 0;
          color: var(--text-white);
          font-family: var(--font-body);
          font-size: 16px;
          transition: border-color 0.2s;
          outline: none;
        }
        .scoutx-input::placeholder {
          color: #353534;
        }
        .scoutx-input:focus {
          border-bottom-color: var(--primary);
        }
        .scoutx-input[type="password"] {
          letter-spacing: 0.2em;
        }

        .scoutx-submit-btn {
          width: 100%;
          background-color: var(--primary);
          color: #000;
          font-family: var(--font-head);
          font-size: 16px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 1rem;
          border-radius: 0.25rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 0 20px rgba(93, 255, 49, 0.2);
          margin-top: 1rem;
        }
        .scoutx-submit-btn:hover:not(:disabled) {
          background-color: var(--primary-hover);
          box-shadow: 0 0 30px rgba(93, 255, 49, 0.4);
        }
        .scoutx-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .scoutx-footer-link {
          margin-top: 2rem;
          text-align: center;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        }
        .scoutx-footer-text {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .scoutx-link {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-decoration: none;
          transition: color 0.2s;
        }
        .scoutx-link:hover {
          color: var(--text-white);
        }

        .scoutx-footer {
          position: relative;
          z-index: 10;
          width: 100%;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .scoutx-copyright {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
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

              {error && <div style={{ color: "#ffb4ab", fontSize: "14px", marginBottom: "1.5rem" }}>{error}</div>}

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
