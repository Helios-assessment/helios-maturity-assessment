// Grouping of the 21 capability layers into the 6 HELIOS strategic domains.
// Review / edit this mapping to regroup layers; everything else derives from it.
export interface Domain {
  id: string;
  name: string;
  tagline: string;
  layerIds: string[];
}

export const DOMAINS: Domain[] = [
  { id: "D1", name: "Digital Culture & Leadership", tagline: "The DNA Layer", layerIds: ["L15", "L16"] },
  {
    id: "D2",
    name: "Learning & Learner Experience",
    tagline: "The Core Value Engine",
    layerIds: ["L03", "L04", "L05", "L06", "L07", "L08", "L09", "L10", "L12"],
  },
  { id: "D3", name: "Research & Innovation", tagline: "The Knowledge Engine", layerIds: ["L14"] },
  { id: "D4", name: "Data & Decision Systems", tagline: "The Intelligence Layer", layerIds: ["L18", "L19"] },
  {
    id: "D5",
    name: "Ecosystem & Partnerships",
    tagline: "The Growth Layer",
    layerIds: ["L01", "L02", "L11", "L13"],
  },
  { id: "D6", name: "Digital Infrastructure", tagline: "The Foundation Layer", layerIds: ["L17", "L20", "L21"] },
];
