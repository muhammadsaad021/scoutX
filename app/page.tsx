/*
  HOME PAGE — This is what users see at localhost:3000/
  
  In Next.js App Router:
  - Every folder inside /app/ becomes a URL route
  - page.tsx inside that folder is what renders
  
  Examples:
    /app/page.tsx          → localhost:3000/
    /app/dashboard/page.tsx → localhost:3000/dashboard
    /app/players/page.tsx   → localhost:3000/players
*/

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        gap: "1.5rem",
      }}
    >
      <h1 style={{ fontSize: "3rem", fontWeight: 800 }}>
        ⚽ Scout
        <span style={{ color: "var(--primary)" }}>X</span>
      </h1>
      <p style={{ fontSize: "1.125rem", maxWidth: "500px" }}>
        Professional football talent scouting, player ranking, and performance
        tracking platform.
      </p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button className="btn btn-primary">Get Started</button>
        <button className="btn btn-secondary">Learn More</button>
      </div>
    </main>
  );
}
