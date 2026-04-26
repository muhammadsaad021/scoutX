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
    <div style={{ padding: "2rem", textAlign: "center", color: "#888888", fontSize: "0.75rem", fontFamily: "'Inter', sans-serif" }}>
      Processing analytics...
    </div>
  );

  if (error === "No data" || !data || data.timeline.length === 0) return null;

  if (error) return (
    <div style={{ padding: "2rem", textAlign: "center", color: "#EF4444", fontSize: "0.75rem", fontFamily: "'Inter', sans-serif" }}>
      {error}
    </div>
  );

  return (
    <div style={{ width: "100%", animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["line", "bar", "radar"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: "0.4rem 1rem", border: "1px solid", borderRadius: "9999px", fontSize: "0.6875rem", cursor: "pointer",
                background: activeTab === tab ? "rgba(93, 255, 49, 0.1)" : "#111111",
                color: activeTab === tab ? "#5DFF31" : "#888888",
                borderColor: activeTab === tab ? "rgba(93, 255, 49, 0.3)" : "#222222",
                fontWeight: 600, transition: "all 0.2s ease",
                textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'Inter', sans-serif"
              }}
            >
              {tab === "line" ? "TREND" : tab === "bar" ? "OUTPUT" : "PROFILE"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: "300px", width: "100%", position: "relative" }}>
        
        {activeTab === "line" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
              <XAxis dataKey="matchName" tick={{ fill: "#888888", fontSize: 10, fontFamily: "'Space Grotesk', monospace" }} axisLine={{ stroke: "#333333" }} />
              <YAxis yAxisId="left" tick={{ fill: "#888888", fontSize: 10, fontFamily: "'Space Grotesk', monospace" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#888888", fontSize: 10, fontFamily: "'Space Grotesk', monospace" }} axisLine={false} tickLine={false} domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ background: "#111111", border: "1px solid #333333", borderRadius: "4px", color: "#FFFFFF", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }}
                labelStyle={{ color: "#5DFF31", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "'Space Grotesk', monospace", textTransform: "uppercase" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px", fontFamily: "'Inter', sans-serif", color: "#A0A0A0" }} />
              <Line yAxisId="left" type="monotone" name="SCORE" dataKey="Score" stroke="#5DFF31" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#000", stroke: "#5DFF31" }} activeDot={{ r: 6, fill: "#5DFF31" }} />
              <Line yAxisId="right" type="monotone" name="RATING" dataKey="Rating" stroke="#A0A0A0" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: "#000", stroke: "#A0A0A0" }} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === "bar" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
              <XAxis dataKey="matchName" tick={{ fill: "#888888", fontSize: 10, fontFamily: "'Space Grotesk', monospace" }} axisLine={{ stroke: "#333333" }} />
              <YAxis tick={{ fill: "#888888", fontSize: 10, fontFamily: "'Space Grotesk', monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ background: "#111111", border: "1px solid #333333", borderRadius: "4px", color: "#FFFFFF", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }}
                cursor={{ fill: "#1A1A1A", opacity: 0.8 }}
                labelStyle={{ color: "#5DFF31", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "'Space Grotesk', monospace", textTransform: "uppercase" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px", fontFamily: "'Inter', sans-serif", color: "#A0A0A0" }} />
              <Bar name="GOALS" dataKey="Goals" fill="#5DFF31" radius={[2, 2, 0, 0]} maxBarSize={40} />
              <Bar name="ASSISTS" dataKey="Assists" fill="#A0A0A0" radius={[2, 2, 0, 0]} maxBarSize={40} />
              <Bar name="PASSES" dataKey="Passes" fill="#333333" radius={[2, 2, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === "radar" && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radar}>
              <PolarGrid stroke="#333333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#FFFFFF", fontSize: 9, fontFamily: "'Space Grotesk', monospace", letterSpacing: "1px" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip 
                formatter={(value: any) => [`${Math.round(Number(value))}%`, "PROXIMITY"]}
                contentStyle={{ background: "#111111", border: "1px solid #333333", borderRadius: "4px", color: "#FFFFFF", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }}
                itemStyle={{ color: "#5DFF31", fontFamily: "'Space Grotesk', monospace" }}
              />
              <Radar name="PROFILE METRICS" dataKey="value" stroke="#5DFF31" strokeWidth={2} fill="#5DFF31" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        )}

      </div>
    </div>
  );
}
