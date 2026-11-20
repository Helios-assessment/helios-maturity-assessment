import { NAAC_LAYERS, NIRF_PARAMS } from "@/data/regulatory";
import { recommendationFor } from "@/data/recommendations";
import { domainOfLayer, layerById, levelForPct, type Responses, type Scores } from "./scoring";

export function strengthsAndGaps(scores: Scores) {
  const scored = scores.layers.filter((l) => l.avg !== null);
  const byAvg = [...scored].sort((a, b) => (b.avg as number) - (a.avg as number));
  return { strengths: byAvg.slice(0, 5), gaps: [...byAvg].reverse().slice(0, 5) };
}

export interface Priority {
  rank: number;
  layerId: string;
  layerName: string;
  domainName: string;
  avg: number;
  gap: number;
  stage: string;
  text: string;
  focus: string[];
  horizon: string;
}

export function prioritise(scores: Scores, responses: Responses): Priority[] {
  const ranked = scores.layers
    .filter((l) => l.avg !== null && (l.gap as number) > 0)
    .sort((a, b) => (b.gap as number) * b.weight - (a.gap as number) * a.weight || (a.avg as number) - (b.avg as number))
    .slice(0, 9);
  return ranked.map((l, i) => {
    const layer = layerById(l.id);
    const rec = recommendationFor(l.id, l.avg as number);
    const focus = layer.dimensions
      .filter((d) => responses[d.id] > 0)
      .sort((a, b) => responses[a.id] - responses[b.id])
      .slice(0, 2)
      .map((d) => d.name);
    return {
      rank: i + 1,
      layerId: l.id,
      layerName: l.name,
      domainName: domainOfLayer(l.id).name,
      avg: l.avg as number,
      gap: l.gap as number,
      stage: rec.stage,
      text: rec.text,
      focus,
      horizon: i < 3 ? "0–6 months" : i < 6 ? "6–18 months" : "18–36 months",
    };
  });
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function regulatory(scores: Scores) {
  const pct = (ids: string[]) => mean(scores.layers.filter((l) => ids.includes(l.id) && l.pct !== null).map((l) => l.pct as number));
  const params = NIRF_PARAMS.map((p) => ({ ...p, pct: pct(p.layerIds) }));
  const valid = params.filter((p) => p.pct !== null);
  const wsum = valid.reduce((a, p) => a + p.weight, 0);
  const nirf = wsum ? valid.reduce((a, p) => a + (p.pct as number) * p.weight, 0) / wsum : null;
  const naac = pct(NAAC_LAYERS);
  return {
    params,
    nirf,
    nirfLevel: nirf === null ? null : levelForPct(nirf),
    naac,
    naacLevel: naac === null ? null : levelForPct(naac),
  };
}
