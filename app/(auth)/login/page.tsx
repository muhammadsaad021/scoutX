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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Plus+Jakarta+Sans:wght@600;700&family=Space+Grotesk:wght@600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        :root {
          --bg-main: #131313;
          --bg-left: #0e0e0e;
          --bg-card: rgba(32, 31, 31, 0.4);
          --border-card: #2a2a2a;
          --border-card-hover: rgba(93, 255, 49, 0.3);
          --border-input: #2a2a2a;
          --border-input-hover: rgba(93, 255, 49, 0.5);
          
          --text-main: #e5e2e1;
          --text-secondary: #c5c7c2;
          --text-white: #ffffff;
          
          --primary: #5dff31;
          --primary-hover: #7aff54;
          --on-primary: #032100;
          
          --font-body: 'Inter', sans-serif;
          --font-head: 'Plus Jakarta Sans', sans-serif;
          --font-mono: 'Space Grotesk', sans-serif;
        }

        .login-page {
          background-color: var(--bg-main);
          color: var(--text-main);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .login-page {
            flex-direction: row;
          }
        }

        .login-left {
          display: none;
          flex-direction: column;
          width: 60%;
          position: relative;
          background-color: var(--bg-left);
        }
        @media (min-width: 768px) {
          .login-left {
            display: flex;
          }
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
          color: var(--primary);
          font-family: var(--font-head);
          font-size: 24px;
          letter-spacing: -0.05em;
          font-weight: 900;
        }

        .login-hero {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          height: 100%;
          padding-bottom: 120px;
          padding-left: 3rem;
          padding-right: 3rem;
        }
        @media (min-width: 1024px) {
          .login-hero { padding-left: 5rem; padding-right: 5rem; }
        }

        .login-hero-sub {
          font-family: var(--font-head);
          font-size: 48px;
          color: var(--text-white);
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
          font-weight: 700;
          line-height: 1.1;
        }

        .login-hero-main {
          font-family: var(--font-head);
          font-size: 64px;
          line-height: 1;
          letter-spacing: -0.02em;
          font-weight: 800;
          color: var(--primary);
          text-shadow: 0 0 15px rgba(93, 255, 49, 0.3);
          margin-bottom: 2rem;
        }

        .login-hero-desc-container {
          display: flex;
          align-items: stretch;
          gap: 1.5rem;
          max-width: 36rem;
        }
        .login-hero-desc-bar {
          width: 2px;
          background-color: var(--primary);
          border-radius: 9999px;
          box-shadow: 0 0 10px rgba(93, 255, 49, 0.5);
        }
        .login-hero-desc {
          font-family: var(--font-body);
          font-size: 16px;
          color: rgba(197, 199, 194, 0.9);
          line-height: 1.6;
        }

        .login-right {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          position: relative;
          background-color: var(--bg-main);
          z-index: 20;
        }
        @media (min-width: 768px) {
          .login-right {
            width: 40%;
            border-left: 1px solid rgba(42, 42, 42, 0.5);
          }
        }
        @media (min-width: 1024px) {
          .login-right { padding: 4rem; }
        }

        .login-mobile-logo {
          position: absolute;
          top: 2rem;
          left: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        @media (min-width: 768px) {
          .login-mobile-logo { display: none; }
        }
        .login-mobile-logo-icon {
          color: var(--primary);
          font-size: 20px;
          font-family: 'Material Symbols Outlined';
          font-variation-settings: 'FILL' 1;
        }
        .login-mobile-logo-text {
          font-family: var(--font-head);
          font-size: 20px;
          color: var(--primary);
          letter-spacing: 0.1em;
          text-transform: lowercase;
          font-weight: 600;
        }

        .login-form-wrapper {
          width: 100%;
          max-width: 400px;
        }

        .login-header {
          margin-bottom: 2.5rem;
          text-align: center;
        }
        @media (min-width: 768px) {
          .login-header { text-align: left; }
        }
        .login-title {
          font-family: var(--font-head);
          font-size: 32px;
          color: var(--text-white);
          margin-bottom: 0.5rem;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .login-subtitle {
          font-family: var(--font-body);
          font-size: 16px;
          color: var(--text-secondary);
        }

        .login-card {
          background-color: var(--bg-card);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--border-card);
          padding: 2rem;
          border-radius: 0.75rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
          overflow: hidden;
          transition: border-color 0.5s;
        }
        .login-card:hover {
          border-color: var(--border-card-hover);
        }

        .login-glow {
          position: absolute;
          top: -5rem;
          right: -5rem;
          width: 10rem;
          height: 10rem;
          background-color: rgba(93, 255, 49, 0.05);
          border-radius: 9999px;
          filter: blur(50px);
          pointer-events: none;
          transition: background-color 0.5s;
        }
        .login-card:hover .login-glow {
          background-color: rgba(93, 255, 49, 0.1);
        }

        .login-form {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .login-input-group {
          position: relative;
        }
        .login-label {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          display: block;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .login-input-wrapper {
          position: relative;
          display: flex;
          align-items: flex-end;
          border-bottom: 1px solid var(--border-input);
          transition: border-color 0.3s;
        }
        .login-input-wrapper:hover {
          border-color: var(--border-input-hover);
        }
        .login-input-wrapper:focus-within {
          border-color: var(--primary);
        }

        .login-input {
          width: 100%;
          background: transparent;
          border: none;
          padding: 0 0 0.5rem 0;
          color: var(--text-white);
          font-family: var(--font-body);
          font-size: 16px;
          outline: none;
        }
        .login-input::placeholder {
          color: #353534;
        }
        .login-input[type="password"] {
          letter-spacing: 0.2em;
        }

        .login-icon {
          font-family: 'Material Symbols Outlined';
          color: var(--text-secondary);
          position: absolute;
          right: 0;
          bottom: 0.5rem;
          pointer-events: none;
          transition: color 0.3s;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .login-input-wrapper:focus-within .login-icon {
          color: var(--primary);
        }

        .login-submit-btn {
          width: 100%;
          background-color: var(--primary);
          color: var(--on-primary);
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          padding: 1rem;
          border-radius: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 0 15px rgba(93, 255, 49, 0.1);
        }
        .login-submit-btn:hover:not(:disabled) {
          background-color: var(--primary-hover);
          box-shadow: 0 0 25px rgba(93, 255, 49, 0.3);
        }
        .login-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .login-submit-icon {
          font-family: 'Material Symbols Outlined';
          font-size: 18px;
          transition: transform 0.3s;
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
          margin-top: 2rem;
          gap: 1rem;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
        }
        @media (min-width: 640px) {
          .login-footer {
            flex-direction: row;
          }
        }
        .login-footer-link {
          color: var(--text-secondary);
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          transition: color 0.3s;
        }
        .login-footer-link:hover {
          color: var(--primary);
        }
        .login-footer-link-group {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .login-footer-arrow {
          font-family: 'Material Symbols Outlined';
          font-size: 14px;
          transition: transform 0.3s;
        }
        .login-footer-link-group:hover .login-footer-arrow {
          transform: translateX(2px) translateY(-2px);
        }
        
        .login-error {
          padding: 0.75rem;
          background-color: #93000a;
          color: #ffdad6;
          border-radius: 0.25rem;
          font-size: 14px;
          font-family: var(--font-body);
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
