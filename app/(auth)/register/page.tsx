"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("Scout");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
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
      body: JSON.stringify({ name, email, password, role }), // Note: organization might not be in our backend schema, ignoring or treating as meta
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
      <div 
        onClick={() => setRole(rTitle)}
        style={{
          flex: 1,
          height: "100px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          background: "var(--bg-secondary)",
          border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border-color)",
          borderRadius: "4px",
          cursor: "pointer",
          transition: "all 0.2s",
          color: isSelected ? "var(--primary)" : "var(--text-muted)"
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>{icon}</span>
        <span style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>{rTitle.toUpperCase()}</span>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0c0c", color: "white", padding: "3rem", display: "flex", flexDirection: "column" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4rem" }}>
        <div>
          <h2 style={{ color: "var(--primary)", margin: 0, fontSize: "1.5rem", letterSpacing: "-1px" }}>scoutX</h2>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%", flex: 1 }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "3rem" }}>
          Create Your Professional<br />Scouting Profile
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          
          {/* Role Selection */}
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "1rem" }}>DESIGNATE OPERATIVE ROLE</div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <RoleBox rTitle="Manager" icon="💼" />
              <RoleBox rTitle="Scout" icon="👁️" />
              <RoleBox rTitle="Admin" icon="⚙️" />
            </div>
          </div>

          {error && <div style={{ color: "var(--danger)", fontSize: "0.875rem" }}>{error}</div>}

          {/* Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div style={{ position: "relative" }}>
              <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "0.5rem" }}>FULL NAME</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Johnathan Sterling" style={{ width: "100%", padding: "0.5rem 0", backgroundColor: "transparent", border: "none", borderBottom: "1px solid var(--border-light)", color: "white", fontSize: "1.1rem", outline: "none" }} onFocus={(e) => e.target.style.borderBottomColor = "var(--primary)"} onBlur={(e) => e.target.style.borderBottomColor = "var(--border-light)"} />
            </div>

            <div style={{ position: "relative" }}>
              <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "0.5rem" }}>EMAIL ADDRESS</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="j.sterling@scoutx.com" style={{ width: "100%", padding: "0.5rem 0", backgroundColor: "transparent", border: "none", borderBottom: "1px solid var(--border-light)", color: "white", fontSize: "1.1rem", outline: "none" }} onFocus={(e) => e.target.style.borderBottomColor = "var(--primary)"} onBlur={(e) => e.target.style.borderBottomColor = "var(--border-light)"} />
            </div>

            <div style={{ position: "relative" }}>
              <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "0.5rem" }}>ORGANIZATION</label>
              <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Pacific Rim United FC" style={{ width: "100%", padding: "0.5rem 0", backgroundColor: "transparent", border: "none", borderBottom: "1px solid var(--border-light)", color: "white", fontSize: "1.1rem", outline: "none" }} onFocus={(e) => e.target.style.borderBottomColor = "var(--primary)"} onBlur={(e) => e.target.style.borderBottomColor = "var(--border-light)"} />
            </div>

            <div style={{ position: "relative" }}>
              <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "0.5rem" }}>PASSWORD</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••••••" style={{ width: "100%", padding: "0.5rem 0", backgroundColor: "transparent", border: "none", borderBottom: "1px solid var(--border-light)", color: "white", fontSize: "1.1rem", outline: "none", letterSpacing: "3px" }} onFocus={(e) => e.target.style.borderBottomColor = "var(--primary)"} onBlur={(e) => e.target.style.borderBottomColor = "var(--border-light)"} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "2rem",
              width: "100%",
              padding: "1.25rem",
              backgroundColor: "var(--primary)",
              color: "#000",
              border: "none",
              borderRadius: "4px",
              fontWeight: 800,
              fontSize: "1rem",
              cursor: "pointer",
              letterSpacing: "1px",
              textAlign: "center"
            }}
          >
            INITIALIZE ACCOUNT
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "1px" }}>
          ALREADY HAVE AN UPLINK? <Link href="/login" style={{ color: "var(--primary)", textDecoration: "none" }}>AUTHENTICATE HERE</Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "4rem" }}>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "1px" }}>
          © 2024 SCOUTX. ALL RIGHTS RESERVED.
        </div>
      </div>
    </div>
  );
}
