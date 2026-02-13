"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface TrendPoint {
  date: string;
  score: number;
}

interface ScoreTrendChartProps {
  data: TrendPoint[];
  title: string;
  emptyText: string;
}

export default function ScoreTrendChart({ data, title, emptyText }: ScoreTrendChartProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-5">
      <p className="text-sm font-medium text-[var(--foreground)] mb-4">{title}</p>

      {!data || data.length === 0 ? (
        <div className="flex items-center justify-center h-48 rounded-md border border-dashed border-[var(--border)]">
          <p className="text-sm text-[var(--gray-500)]">{emptyText}</p>
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--gray-500)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "var(--gray-500)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                labelStyle={{ color: "var(--gray-500)", fontSize: "12px" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--foreground)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: "var(--foreground)", stroke: "var(--background)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export type { TrendPoint };
