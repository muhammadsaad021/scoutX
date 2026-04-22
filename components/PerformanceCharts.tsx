"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

type ChartData = {
  timeline: any[];
  radar: any[];
};

export default function PerformanceCharts({ playerId }: { playerId: number }) {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"radar" | "line" | "bar">("line");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/players/${playerId}/charts`);
        if (res.status === 404) {
          setError("No data");
        } else if (res.ok) {
          setData(await res.json());
        } else {
          setError("Failed to load charts.");
        }
      } catch (err) {
        setError("Error loading charts.");
      }
      setLoading(false);
    };
    fetchData();
  }, [playerId]);

  if (loading) return (
    <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
      Loading charts...
    </div>
  );

  if (error === "No data" || !data || data.timeline.length === 0) return null; // Don't show chart section if no data

  if (error) return (
    <div style={{ padding: "2rem", textAlign: "center", color: "var(--danger)" }}>
      {error}
    </div>
  );

  return (
    <div className="card animate-fade-in" style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem" }}>📊 Performance Visualization</h3>
        
        {/* Chart Type Selector */}
        <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "0.25rem" }}>
          <button
            onClick={() => setActiveTab("line")}
            style={{
              padding: "0.4rem 1rem", border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", cursor: "pointer",
              background: activeTab === "line" ? "var(--bg-card)" : "transparent",
              color: activeTab === "line" ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: activeTab === "line" ? 600 : 400,
              boxShadow: activeTab === "line" ? "var(--shadow-sm)" : "none", transition: "all 0.2s ease"
            }}
          >
            Trend (Line)
          </button>
          <button
            onClick={() => setActiveTab("bar")}
            style={{
              padding: "0.4rem 1rem", border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", cursor: "pointer",
              background: activeTab === "bar" ? "var(--bg-card)" : "transparent",
              color: activeTab === "bar" ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: activeTab === "bar" ? 600 : 400,
              boxShadow: activeTab === "bar" ? "var(--shadow-sm)" : "none", transition: "all 0.2s ease"
            }}
          >
            Output (Bar)
          </button>
          <button
            onClick={() => setActiveTab("radar")}
            style={{
              padding: "0.4rem 1rem", border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", cursor: "pointer",
              background: activeTab === "radar" ? "var(--bg-card)" : "transparent",
              color: activeTab === "radar" ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: activeTab === "radar" ? 600 : 400,
              boxShadow: activeTab === "radar" ? "var(--shadow-sm)" : "none", transition: "all 0.2s ease"
            }}
          >
            Profile (Radar)
          </button>
        </div>
      </div>

      <div style={{ height: "350px", width: "100%", position: "relative" }}>
        
        {activeTab === "line" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="matchName" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--border-color)" }} />
              <YAxis yAxisId="left" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}
                labelStyle={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "0.5rem" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line yAxisId="left" type="monotone" name="Overall Score" dataKey="Score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" name="Match Rating" dataKey="Rating" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === "bar" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="matchName" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--border-color)" }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}
                cursor={{ fill: "var(--bg-secondary)", opacity: 0.5 }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar name="Goals" dataKey="Goals" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar name="Assists" dataKey="Assists" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar name="Passes" dataKey="Passes" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === "radar" && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.radar}>
              <PolarGrid stroke="var(--border-color)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-primary)", fontSize: 12, fontWeight: 500 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}
                formatter={(value: number) => [`${Math.round(value)}% (Relative)`, "Rating"]}
              />
              <Radar name="Player Profile" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        )}

      </div>
    </div>
  );
}
