"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { LEVELS, TARGET_LEVEL } from "@/lib/config";
import { LAYERS, type Scores } from "@/lib/scoring";

const NAVY = "#12224a";
const GOLD = "#a97c22";
const MUTED = "#8b95ab";
const SHORT: Record<string, string> = { D1: "Culture", D2: "Learning", D3: "Research", D4: "Data & AI", D5: "Ecosystem", D6: "Infrastructure" };
// Charts use fixed pixel sizes so they render identically on screen, in print and in the HTML export.

export function DomainRadar({ scores }: { scores: Scores }) {
  const data = scores.domains.map((d) => ({
    name: `${d.id} ${SHORT[d.id] ?? ""}`.trim(),
    full: d.name,
    current: d.avg ?? 0,
    target: TARGET_LEVEL,
  }));
  return (
    <RadarChart width={440} height={340} data={data} outerRadius={110}>
      <PolarGrid stroke="#d5d9e4" />
      <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: NAVY }} />
      <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} tick={{ fontSize: 10, fill: MUTED }} />
      <Radar name={`Target (L${TARGET_LEVEL})`} dataKey="target" stroke={MUTED} strokeDasharray="5 4" fill={MUTED} fillOpacity={0.08} isAnimationActive={false} />
      <Radar name="Current state" dataKey="current" stroke={GOLD} fill={GOLD} fillOpacity={0.35} strokeWidth={2} isAnimationActive={false} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
    </RadarChart>
  );
}

export function LayerRadar({ scores }: { scores: Scores }) {
  const data = scores.layers.map((l) => ({ name: l.id, current: l.avg ?? 0, target: TARGET_LEVEL }));
  return (
    <RadarChart width={440} height={340} data={data} outerRadius={115}>
      <PolarGrid stroke="#d5d9e4" />
      <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: NAVY }} />
      <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} tick={{ fontSize: 9, fill: MUTED }} />
      <Radar name={`Target (L${TARGET_LEVEL})`} dataKey="target" stroke={MUTED} strokeDasharray="5 4" fill={MUTED} fillOpacity={0.08} isAnimationActive={false} />
      <Radar name="Current state" dataKey="current" stroke={NAVY} fill={NAVY} fillOpacity={0.3} strokeWidth={2} isAnimationActive={false} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
    </RadarChart>
  );
}

export function LayerBars({ scores }: { scores: Scores }) {
  const data = scores.layers.map((l) => ({ name: l.id, current: l.avg ? Math.round(l.avg * 100) / 100 : 0 }));
  return (
    <BarChart width={900} height={280} data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e6ee" />
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: NAVY }} />
      <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: NAVY }} />
      <ReferenceLine y={TARGET_LEVEL} stroke="#b4452f" strokeDasharray="6 4" label={{ value: `Target L${TARGET_LEVEL}`, fontSize: 11, fill: "#b4452f", position: "insideTopRight" }} />
      <Bar dataKey="current" name="Current maturity (1–5)" fill={GOLD} isAnimationActive={false} />
    </BarChart>
  );
}

export function Heatmap({ responses }: { responses: Record<string, number> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-auto border-separate border-spacing-1 text-[11px]">
        <tbody>
          {LAYERS.map((l) => (
            <tr key={l.id}>
              <td className="whitespace-nowrap pr-2 font-semibold text-navy-900">
                {l.id} <span className="font-normal text-navy-700">{l.name}</span>
              </td>
              {l.dimensions.map((d) => {
                const v = responses[d.id];
                const lvl = v && v > 0 ? LEVELS[v - 1] : null;
                return (
                  <td
                    key={d.id}
                    title={`${d.name}: ${v === undefined ? "unanswered" : v === 0 ? "N/A" : "L" + v}`}
                    className="h-6 min-w-[2.2rem] rounded text-center font-semibold text-white"
                    style={{ backgroundColor: lvl ? lvl.color : v === 0 ? "#c7ccd8" : "#eef0f5", color: lvl || v === 0 ? "#fff" : "#8b95ab" }}
                  >
                    {v === undefined ? "–" : v === 0 ? "NA" : v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-navy-700">
        {LEVELS.map((l) => (
          <span key={l.level} className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded" style={{ background: l.color }} /> L{l.level} {l.name}
          </span>
        ))}
      </div>
    </div>
  );
}
