"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      {/* Left side: Background and Marketing Text */}
      <div style={{
        flex: 1,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "3rem",
        color: "white",
        backgroundImage: "linear-gradient(to right, rgba(9, 9, 11, 0.9) 0%, rgba(9, 9, 11, 0.4) 100%), url('/stadium_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ color: "var(--primary)", margin: 0, fontSize: "1.5rem", letterSpacing: "-1px" }}>scoutX</h2>
          </div>
        </div>

        {/* Main Marketing Text */}
        <div style={{ marginTop: "-5rem" }}>
          <h1 style={{ fontSize: "5rem", fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
            THE FUTURE OF<br />
            <span style={{ color: "var(--primary)" }}>TALENT</span><br />
            <span style={{ color: "var(--primary)" }}>IDENTIFICATION</span>
          </h1>
          <p style={{
            marginTop: "2rem",
            fontSize: "1.25rem",
            color: "var(--text-secondary)",
            maxWidth: "600px",
            lineHeight: 1.6,
            borderLeft: "3px solid var(--primary)",
            paddingLeft: "1.5rem"
          }}>
            Access high-density analytics, biomechanical reporting, and real-time prospect tracking across global scouting networks.
          </p>
        </div>

        {/* Removed Bottom Stats */}
      </div>

      {/* Right side: Login Form */}
      <div style={{
        width: "500px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "4rem",
        backgroundColor: "#000000"
      }}>
        <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Command Center Login</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Enter your credentials to access the scout network.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {error && (
              <div style={{ padding: "0.75rem", backgroundColor: "var(--danger)", color: "white", borderRadius: "var(--radius-sm)", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}
            
            <div style={{ position: "relative" }}>
              <label htmlFor="email" style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "0.5rem", textTransform: "uppercase" }}>Tactical ID (Email)</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@scoutx.com"
                required
                style={{
                  width: "100%",
                  padding: "0.5rem 0",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border-light)",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none"
                }}
                onFocus={(e) => e.target.style.borderBottomColor = "var(--primary)"}
                onBlur={(e) => e.target.style.borderBottomColor = "var(--border-light)"}
              />
              <span style={{ position: "absolute", right: 0, bottom: "0.5rem", color: "var(--text-muted)" }}>@</span>
            </div>

            <div style={{ position: "relative" }}>
              <label htmlFor="password" style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "0.5rem", textTransform: "uppercase" }}>Access Key (Password)</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: "100%",
                  padding: "0.5rem 0",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border-light)",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                  letterSpacing: "3px"
                }}
                onFocus={(e) => e.target.style.borderBottomColor = "var(--primary)"}
                onBlur={(e) => e.target.style.borderBottomColor = "var(--border-light)"}
              />
              <span style={{ position: "absolute", right: 0, bottom: "0.5rem", color: "var(--text-muted)" }}>🔒</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "1rem",
                width: "100%",
                padding: "1rem",
                backgroundColor: "var(--primary)",
                color: "#000",
                border: "none",
                borderRadius: "4px",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                letterSpacing: "1px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>SIGN IN</span>
              <span>→</span>
            </button>
          </form>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3rem", fontSize: "0.75rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
            <Link href="#" style={{ color: "var(--text-muted)", textDecoration: "none" }}>? FORGOT PASSWORD</Link>
            <Link href="/register" style={{ color: "var(--primary)", textDecoration: "none" }}>REGISTER AS A NEW USER 👤+</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
