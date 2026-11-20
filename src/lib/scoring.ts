import framework from "@/data/framework.json";
import { DOMAINS } from "@/data/domains";
import { LAYER_WEIGHTS, LEVELS, TARGET_LEVEL, type Level } from "./config";

export interface Dimension {
  id: string;
  name: string;
  capabilities: string[];
}
export interface Layer {
  id: string;
  number: number;
  name: string;
  dimensions: Dimension[];
}

export const LAYERS = framework as Layer[];
export const DIMENSIONS = LAYERS.flatMap((l) => l.dimensions);
export const TOTAL_DIMENSIONS = DIMENSIONS.length;
export const layerById = (id: string) => LAYERS.find((l) => l.id === id)!;

/** dimensionId -> 1..5 (maturity level) or 0 (not applicable). Missing = unanswered. */
export type Responses = Record<string, number>;

export const toPct = (avg: number) => Math.round(((avg - 1) / 4) * 1000) / 10;
export const TARGET_PCT = toPct(TARGET_LEVEL);

export function levelForPct(pct: number): Level {
  let result = LEVELS[0];
  for (const l of LEVELS) if (pct >= l.min) result = l;
  return result;
}

export interface LayerScore {
  id: string;
  name: string;
  avg: number | null; // 1..5
  pct: number | null; // 0..100
  answered: number;
  total: number;
  gap: number | null; // levels below target (>= 0)
  weight: number;
}

export function scoreLayer(layer: Layer, r: Responses): LayerScore {
  const vals = layer.dimensions.map((d) => r[d.id]).filter((v) => v !== undefined);
  const scored = vals.filter((v) => v > 0);
  const avg = scored.length ? scored.reduce((a, b) => a + b, 0) / scored.length : null;
  return {
    id: layer.id,
    name: layer.name,
    avg,
    pct: avg === null ? null : toPct(avg),
    answered: vals.length,
    total: layer.dimensions.length,
    gap: avg === null ? null : Math.max(0, TARGET_LEVEL - avg),
    weight: LAYER_WEIGHTS[layer.id] ?? 1,
  };
}

function weighted(items: { avg: number | null; weight: number }[]): number | null {
  const valid = items.filter((i) => i.avg !== null);
  const w = valid.reduce((a, i) => a + i.weight, 0);
  if (!w) return null;
  return valid.reduce((a, i) => a + (i.avg as number) * i.weight, 0) / w;
}

export interface DomainScore {
  id: string;
  name: string;
  tagline: string;
  avg: number | null;
  pct: number | null;
  answered: number;
  total: number;
  layerIds: string[];
}

export interface Scores {
  layers: LayerScore[];
  domains: DomainScore[];
  overallAvg: number | null;
  overallPct: number | null;
  level: Level | null;
  answered: number;
  total: number;
  complete: boolean;
}

export function computeScores(r: Responses): Scores {
  const layers = LAYERS.map((l) => scoreLayer(l, r));
  const domains: DomainScore[] = DOMAINS.map((d) => {
    const ls = layers.filter((l) => d.layerIds.includes(l.id));
    const avg = weighted(ls);
    return {
      id: d.id,
      name: d.name,
      tagline: d.tagline,
      avg,
      pct: avg === null ? null : toPct(avg),
      answered: ls.reduce((a, l) => a + l.answered, 0),
      total: ls.reduce((a, l) => a + l.total, 0),
      layerIds: d.layerIds,
    };
  });
  const overallAvg = weighted(layers);
  const overallPct = overallAvg === null ? null : toPct(overallAvg);
  const answered = layers.reduce((a, l) => a + l.answered, 0);
  return {
    layers,
    domains,
    overallAvg,
    overallPct,
    level: overallPct === null ? null : levelForPct(overallPct),
    answered,
    total: TOTAL_DIMENSIONS,
    complete: answered === TOTAL_DIMENSIONS,
  };
}

export const domainOfLayer = (layerId: string) => DOMAINS.find((d) => d.layerIds.includes(layerId))!;
