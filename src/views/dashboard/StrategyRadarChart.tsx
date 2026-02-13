"use client";

import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

interface StrategyScore {
  name: string;
  score: number;
}

interface StrategyRadarChartProps {
  data: StrategyScore[];
  title: string;
  emptyText: string;
}

export default function StrategyRadarChart({ data, title, emptyText }: StrategyRadarChartProps) {
  const avgScore = data?.length
    ? Math.round(data.reduce((s, d) => s + d.score, 0) / data.length)
    : 0;

  return (
    <div className="rounded-lg border border-[var(--border)] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
        {data?.length > 0 && (
          <span className="text-xs text-[var(--gray-500)] tabular-nums">
            avg {avgScore}
          </span>
        )}
      </div>

      {!data || data.length === 0 ? (
        <div className="flex items-center justify-center h-48 rounded-md border border-dashed border-[var(--border)]">
          <p className="text-sm text-[var(--gray-500)]">{emptyText}</p>
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "var(--gray-500)" }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                dataKey="score"
                stroke="var(--foreground)"
                fill="var(--foreground)"
                fillOpacity={0.08}
                strokeWidth={1.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
