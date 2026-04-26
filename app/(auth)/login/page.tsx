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
      if (result.error === "CredentialsSignin" || result.error === "Configuration") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(result.error);
      }
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <>
      <style>{`
        .login-page {
          background-color: #131313;
          color: var(--color-text-secondary);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .login-page { flex-direction: row; }
        }

        .login-left {
          display: none;
          flex-direction: column;
          width: 60%;
          position: relative;
          background-color: var(--color-bg-elevated);
        }
        @media (min-width: 768px) {
          .login-left { display: flex; }
        }

        .login-bg-img {
          position: absolute;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.6;
          mix-blend-mode: luminosity;
        }
        .login-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(19, 19, 19, 0.8), rgba(19, 19, 19, 0.4), rgba(19, 19, 19, 0.9));
        }

        .login-logo {
          position: absolute;
          top: 40px;
          left: 40px;
          z-index: 10;
          color: var(--color-primary);
          font-family: var(--font-heading);
          font-size: var(--text-2xl);
          letter-spacing: -0.05em;
          font-weight: var(--fw-black);
        }

        .login-hero {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          height: 100%;
          padding-bottom: 120px;
          padding-left: var(--space-3xl);
          padding-right: var(--space-3xl);
        }
        @media (min-width: 1024px) {
          .login-hero { padding-left: 5rem; padding-right: 5rem; }
        }

        .login-hero-sub {
          font-family: var(--font-heading);
          font-size: var(--text-5xl);
          color: var(--color-text-primary);
          margin-bottom: var(--space-sm);
          letter-spacing: -0.02em;
          font-weight: var(--fw-bold);
          line-height: var(--lh-tight);
        }

        .login-hero-main {
          font-family: var(--font-heading);
          font-size: var(--text-6xl);
          line-height: 1;
          letter-spacing: -0.02em;
          font-weight: var(--fw-extrabold);
          color: var(--color-primary);
          text-shadow: 0 0 15px var(--color-primary-glow);
          margin-bottom: var(--space-xl);
        }

        .login-hero-desc-container {
          display: flex;
          align-items: stretch;
          gap: var(--space-lg);
          max-width: 36rem;
        }
        .login-hero-desc-bar {
          width: 2px;
          background-color: var(--color-primary);
          border-radius: var(--radius-full);
          box-shadow: 0 0 10px rgba(93, 255, 49, 0.5);
        }
        .login-hero-desc {
          font-family: var(--font-body);
          font-size: var(--text-md);
          color: rgba(197, 199, 194, 0.9);
          line-height: var(--lh-relaxed);
        }

        .login-right {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: var(--space-xl);
          position: relative;
          background-color: #131313;
          z-index: 20;
        }
        @media (min-width: 768px) {
          .login-right {
            width: 40%;
            border-left: 1px solid var(--color-border-subtle);
          }
        }
        @media (min-width: 1024px) {
          .login-right { padding: 4rem; }
        }

        .login-mobile-logo {
          position: absolute;
          top: var(--space-xl);
          left: var(--space-xl);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        @media (min-width: 768px) {
          .login-mobile-logo { display: none; }
        }
        .login-mobile-logo-icon {
          color: var(--color-primary);
          font-size: 20px;
          font-family: 'Material Symbols Outlined';
          font-variation-settings: 'FILL' 1;
        }
        .login-mobile-logo-text {
          font-family: var(--font-heading);
          font-size: 20px;
          color: var(--color-primary);
          letter-spacing: 0.1em;
          text-transform: lowercase;
          font-weight: var(--fw-semibold);
        }

        .login-form-wrapper {
          width: 100%;
          max-width: 400px;
        }

        .login-header {
          margin-bottom: var(--space-2xl);
          text-align: center;
        }
        @media (min-width: 768px) {
          .login-header { text-align: left; }
        }
        .login-title {
          font-family: var(--font-heading);
          font-size: 32px;
          color: var(--color-text-primary);
          margin-bottom: var(--space-sm);
          font-weight: var(--fw-semibold);
          letter-spacing: -0.01em;
        }
        .login-subtitle {
          font-family: var(--font-body);
          font-size: var(--text-md);
          color: var(--color-text-muted);
        }

        .login-card {
          background-color: rgba(32, 31, 31, 0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--color-border);
          padding: var(--space-xl);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          position: relative;
          overflow: hidden;
          transition: border-color var(--transition-slow);
        }
        .login-card:hover {
          border-color: var(--color-border-primary);
        }

        .login-glow {
          position: absolute;
          top: -5rem;
          right: -5rem;
          width: 10rem;
          height: 10rem;
          background-color: rgba(93, 255, 49, 0.05);
          border-radius: var(--radius-full);
          filter: blur(50px);
          pointer-events: none;
          transition: background-color var(--transition-slow);
        }
        .login-card:hover .login-glow {
          background-color: rgba(93, 255, 49, 0.1);
        }

        .login-form {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .login-input-group {
          position: relative;
        }
        .login-label {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          margin-bottom: var(--space-sm);
          display: block;
          letter-spacing: var(--ls-widest);
          text-transform: uppercase;
          font-weight: var(--fw-semibold);
        }

        .login-input-wrapper {
          position: relative;
          display: flex;
          align-items: flex-end;
          border-bottom: 1px solid var(--color-border);
          transition: border-color var(--transition-slow);
        }
        .login-input-wrapper:hover {
          border-color: var(--color-border-primary);
        }
        .login-input-wrapper:focus-within {
          border-color: var(--color-primary);
        }

        .login-input {
          width: 100%;
          background: transparent;
          border: none;
          padding: 0 0 var(--space-sm) 0;
          color: var(--color-text-primary);
          font-family: var(--font-body);
          font-size: var(--text-md);
          outline: none;
        }
        .login-input::placeholder {
          color: var(--color-text-dim);
        }
        .login-input[type="password"] {
          letter-spacing: 0.2em;
        }

        .login-icon {
          font-family: 'Material Symbols Outlined';
          color: var(--color-text-muted);
          position: absolute;
          right: 0;
          bottom: var(--space-sm);
          pointer-events: none;
          transition: color var(--transition-slow);
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .login-input-wrapper:focus-within .login-icon {
          color: var(--color-primary);
        }

        .login-submit-btn {
          width: 100%;
          background-color: var(--color-primary);
          color: var(--color-on-primary);
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          font-weight: var(--fw-semibold);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          text-transform: uppercase;
          letter-spacing: var(--ls-widest);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          border: none;
          cursor: pointer;
          transition: all var(--transition-slow);
          box-shadow: 0 0 15px rgba(93, 255, 49, 0.1);
        }
        .login-submit-btn:hover:not(:disabled) {
          background-color: var(--color-primary-hover);
          box-shadow: var(--shadow-glow-lg);
        }
        .login-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .login-submit-icon {
          font-family: 'Material Symbols Outlined';
          font-size: 18px;
          transition: transform var(--transition-slow);
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .login-submit-btn:hover:not(:disabled) .login-submit-icon {
          transform: translateX(4px);
        }

        .login-footer {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-xl);
          gap: var(--space-md);
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          font-weight: var(--fw-semibold);
        }
        @media (min-width: 640px) {
          .login-footer { flex-direction: row; }
        }
        .login-footer-link {
          color: var(--color-text-muted);
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: var(--ls-widest);
          transition: color var(--transition-slow);
        }
        .login-footer-link:hover {
          color: var(--color-primary);
        }
        .login-footer-link-group {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }
        .login-footer-arrow {
          font-family: 'Material Symbols Outlined';
          font-size: 14px;
          transition: transform var(--transition-slow);
        }
        .login-footer-link-group:hover .login-footer-arrow {
          transform: translateX(2px) translateY(-2px);
        }
        
        .login-error {
          padding: var(--space-lg);
          background-color: rgba(239, 68, 68, 0.15);
          color: var(--color-danger);
          border-radius: var(--radius-sm);
          font-size: var(--text-base);
          font-family: var(--font-body);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
      `}</style>

      <div className="login-page">
        {/* Left Side: Image & Branding */}
        <div className="login-left">
          <img 
            alt="Stadium at night" 
            className="login-bg-img" 
            src="/stadium_bg.png" 
          />
          <div className="login-bg-overlay"></div>
          
          <div className="login-logo">
            scoutX
          </div>

          <div className="login-hero">
            <h1 className="login-hero-sub">THE FUTURE OF</h1>
            <div className="login-hero-main">
              TALENT<br/>IDENTIFICATION
            </div>
            <div className="login-hero-desc-container">
              <div className="login-hero-desc-bar"></div>
              <p className="login-hero-desc">
                Access high-density analytics, biomechanical reporting, and real-time prospect tracking across global scouting networks.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-right">
          <div className="login-mobile-logo">
            <span className="login-mobile-logo-icon">target</span>
            <span className="login-mobile-logo-text">scoutX</span>
          </div>

          <div className="login-form-wrapper">
            <div className="login-header">
              <h2 className="login-title">Login</h2>
              <p className="login-subtitle">Enter your credentials to access the scout network.</p>
            </div>

            <div className="login-card">
              <div className="login-glow"></div>
              <form onSubmit={handleSubmit} className="login-form">
                
                {error && (
                  <div className="login-error">
                    {error}
                  </div>
                )}

                <div className="login-input-group">
                  <label className="login-label" htmlFor="email">EMAIL</label>
                  <div className="login-input-wrapper">
                    <input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="operative@scoutx.network" 
                      className="login-input" 
                    />
                    <span className="login-icon">alternate_email</span>
                  </div>
                </div>

                <div className="login-input-group">
                  <label className="login-label" htmlFor="password">PASSWORD</label>
                  <div className="login-input-wrapper">
                    <input 
                      id="password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      placeholder="••••••••••••" 
                      className="login-input" 
                    />
                    <span className="login-icon">lock</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="login-submit-btn"
                >
                  <span>{loading ? "SIGNING IN..." : "SIGN IN"}</span>
                  <span className="login-submit-icon">arrow_forward</span>
                </button>
              </form>
            </div>

            <div className="login-footer">
              <Link href="#" className="login-footer-link">
                FORGOT PASSWORD
              </Link>
              <Link href="/register" className="login-footer-link login-footer-link-group">
                <span>REGISTER AS A NEW USER</span>
                <span className="login-footer-arrow">north_east</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
