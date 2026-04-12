import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  // Redundant safety check in case middleware misses (it shouldn't)
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container" style={{ paddingTop: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Dashboard</h1>
        {/* We use a Server Action to log out smoothly */}
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button type="submit" className="btn btn-secondary">
            Log Out
          </button>
        </form>
      </div>

      <div className="card animate-slide-in">
        <h3>Welcome back, {session.user.name || session.user.email}!</h3>
        <p style={{ marginTop: "1rem" }}>
          Your Role: <span className="badge badge-primary">{(session.user as any).role}</span>
        </p>
      </div>
    </div>
  );
}
