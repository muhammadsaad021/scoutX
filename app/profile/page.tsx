"use client";

import { useSession, signOut } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();
  
  if (!session?.user) return null;

  const userName = session.user.name || "SCOUT X OPERATIVE";
  const userRole = (session.user as any).role || "SCOUT";
  const userEmail = session.user.email || "No email linked";
  const userId = session.user.id || "00000";
  const dateJoined = (session.user as any).createdAt 
    ? new Date((session.user as any).createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase() 
    : "12 JAN 2023";

  return (
    <>
      <style>{`
        .scoutx-prof-bg {
          background-color: var(--color-bg-elevated);
          min-height: 100vh;
          padding: var(--space-xl);
          color: var(--color-text-primary);
          font-family: var(--font-body);
        }
        .scoutx-prof-container {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          padding-top: 1rem;
        }

        .scoutx-prof-header-card {
          position: relative;
          background-color: #161616;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.05);
          height: 160px;
          display: flex;
          align-items: center;
          padding: 0 2.5rem;
        }

        .scoutx-prof-watermark {
          position: absolute;
          right: 2.5rem;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.03;
          pointer-events: none;
        }
        .scoutx-prof-watermark span {
          font-size: 200px;
          font-weight: 300;
        }

        .scoutx-prof-title-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .scoutx-prof-name {
          font-family: var(--font-heading);
          font-size: var(--text-5xl);
          color: var(--color-text-primary);
          text-transform: uppercase;
          margin: 0;
          line-height: 1;
          letter-spacing: var(--ls-tight);
          font-weight: var(--fw-bold);
        }
        .scoutx-prof-role-badge {
          background-color: var(--color-primary);
          color: var(--color-on-primary);
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-top: 0.25rem;
          text-transform: uppercase;
        }

        .scoutx-prof-sysid {
          font-size: 14px;
          color: var(--color-accent);
          letter-spacing: 0.025em;
          font-weight: 500;
          margin: 0;
        }

        .scoutx-prof-section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-top: 1.5rem;
          padding-bottom: 0.5rem;
        }
        .scoutx-prof-section-title div {
          width: 1.5rem;
          height: 1px;
          background-color: var(--color-primary);
        }
        .scoutx-prof-section-title h3 {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          margin: 0;
        }

        .scoutx-prof-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .scoutx-prof-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .scoutx-prof-card {
          background-color: #161616;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 0.75rem;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .scoutx-prof-field-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-ghost);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }
        .scoutx-prof-field-value {
          background-color: #222222;
          border-radius: 0.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          margin-bottom: 2rem;
        }
        .scoutx-prof-field-value:last-child {
          margin-bottom: 0;
        }
        
        .scoutx-prof-field-inner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .scoutx-prof-field-icon {
          color: #a1a1aa;
          font-size: 18px;
        }
        .scoutx-prof-field-text {
          font-size: 15px;
          color: var(--color-text-secondary);
        }
        .scoutx-prof-field-lock {
          color: #71717a;
          font-size: 18px;
        }

        .scoutx-prof-auth-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .scoutx-prof-auth-title h4 {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
        }
        .scoutx-prof-auth-desc {
          font-size: 14px;
          color: #a1a1aa;
          line-height: 1.6;
          margin-bottom: 2.5rem;
          padding-right: 2rem;
        }

        .scoutx-prof-btn-outline {
          width: 100%;
          background-color: #222222;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 0.25rem;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: border-color 0.2s;
          margin-top: auto;
        }
        .scoutx-prof-btn-outline:hover {
          border-color: rgba(93, 255, 49, 0.3);
        }
        .scoutx-prof-btn-outline span.text {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--color-primary);
        }

        .scoutx-prof-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 4rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          margin-top: 3rem;
          margin-bottom: 5rem;
          max-width: 42rem;
        }
        @media (min-width: 640px) {
          .scoutx-prof-actions {
            flex-direction: row;
          }
        }
        
        .scoutx-prof-btn-primary {
          flex: 1;
          background-color: var(--color-primary);
          color: var(--color-on-primary);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 1rem 1.5rem;
          border-radius: 0.25rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .scoutx-prof-btn-primary:hover {
          background-color: #4ce620;
        }
        
        .scoutx-prof-btn-danger {
          flex: 1;
          background-color: #1a1a1a;
          border: 1px solid #27272a;
          color: #ff5c5c;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 1rem 1.5rem;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .scoutx-prof-btn-danger:hover {
          background-color: #222222;
        }
      `}</style>

      <div className="scoutx-prof-bg">
        <div className="scoutx-prof-container">
          
          <div className="scoutx-prof-header-card">
            <div className="scoutx-prof-watermark">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <div style={{ position: "relative", zIndex: 10, width: "100%" }}>
              <div className="scoutx-prof-title-row">
                <h2 className="scoutx-prof-name">{userName}</h2>
                <span className="scoutx-prof-role-badge">{userRole}</span>
              </div>
              <p className="scoutx-prof-sysid">SYSTEM ID: USR-{userId}</p>
            </div>
          </div>

          <div>
            <div className="scoutx-prof-section-title">
              <div></div>
              <h3>SECURITY & SYSTEM SETTINGS</h3>
            </div>
            
            <div className="scoutx-prof-grid">
              
              <div className="scoutx-prof-card" style={{ justifyContent: "center" }}>
                <div style={{ marginBottom: "2rem" }}>
                  <label className="scoutx-prof-field-label">EMAIL</label>
                  <div className="scoutx-prof-field-value">
                    <div className="scoutx-prof-field-inner">
                      <span className="scoutx-prof-field-icon">@</span>
                      <span className="scoutx-prof-field-text">{userEmail}</span>
                    </div>
                    <span className="material-symbols-outlined scoutx-prof-field-lock">lock</span>
                  </div>
                </div>
                
                <div>
                  <label className="scoutx-prof-field-label">DATE JOINED</label>
                  <div className="scoutx-prof-field-value" style={{ marginBottom: 0 }}>
                    <div className="scoutx-prof-field-inner">
                      <span className="material-symbols-outlined scoutx-prof-field-icon">calendar_today</span>
                      <span className="scoutx-prof-field-text">{dateJoined}</span>
                    </div>
                    <span className="material-symbols-outlined scoutx-prof-field-lock">lock</span>
                  </div>
                </div>
              </div>

              <div className="scoutx-prof-card">
                <div className="scoutx-prof-auth-title">
                  <span className="material-symbols-outlined" style={{ color: "#5DFF31", fontSize: "22px" }}>key</span>
                  <h4>Access Authorization</h4>
                </div>
                <p className="scoutx-prof-auth-desc">
                  Ensure your tactical console remains secure. Update your credentials regularly to maintain clearance levels.
                </p>
                
                <button className="scoutx-prof-btn-outline" onClick={() => alert("Password change functionality to be implemented.")}>
                  <span className="text">CHANGE PASSWORD</span>
                  <span className="material-symbols-outlined" style={{ color: "#5DFF31", fontSize: "18px" }}>arrow_forward</span>
                </button>
              </div>

            </div>

            <div className="scoutx-prof-actions">
              <button className="scoutx-prof-btn-primary" onClick={() => alert("Profile details update to be implemented.")}>
                UPDATE PROFILE DETAILS
              </button>
              <button className="scoutx-prof-btn-danger" onClick={() => signOut({ callbackUrl: '/login' })}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
                SIGN OUT
              </button>
            </div>
            
          </div>

        </div>
      </div>
    </>
  );
}
