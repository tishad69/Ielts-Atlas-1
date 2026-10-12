"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export interface TrendPoint {
  label: string;
  band: number;
}

export function BandTrendChart({ data, color = "#7c5cff" }: { data: TrendPoint[]; color?: string }) {
  if (!data.length) {
    return <div className="flex h-48 items-center justify-center text-sm text-slate-500">No data yet — your first submission will appear here.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
        <YAxis domain={[0, 9]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#0b0f1d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: "#cbd5e1" }}
        />
        <Line type="monotone" dataKey="band" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
