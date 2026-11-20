// Indicative "digital readiness" lenses for Indian regulatory frameworks.
// These map HELIOS layers to the parameters the regulators measure. They show how ready
// your digital capability is to *support* evidence and performance; they are NOT predicted
// NIRF scores or NAAC grades.
//
// NIRF weights: 2024/2025 parameter weights for Universities & Management categories
// (TLR 0.30, RPC 0.30, GO 0.20, OI 0.10, PR 0.10; Colleges use TLR 0.40, RPC 0.15, GO 0.25).
// Source: nirfindia.org framework documents.
export interface NirfParam {
  code: string;
  name: string;
  weight: number;
  layerIds: string[];
}

export const NIRF_PARAMS: NirfParam[] = [
  { code: "TLR", name: "Teaching, Learning & Resources", weight: 0.3, layerIds: ["L03", "L04", "L05", "L15", "L16", "L21"] },
  { code: "RPC", name: "Research & Professional Practice", weight: 0.3, layerIds: ["L14", "L18"] },
  { code: "GO", name: "Graduation Outcomes", weight: 0.2, layerIds: ["L06", "L07", "L12", "L13"] },
  { code: "OI", name: "Outreach & Inclusivity", weight: 0.1, layerIds: ["L01", "L02", "L08", "L11"] },
  { code: "PR", name: "Perception", weight: 0.1, layerIds: ["L01", "L09", "L10", "L13"] },
];

// NAAC moved in 2025 to Binary Accreditation with optional Maturity-Based Graded Levels (MBGL 1-5),
// with data validated digitally. These layers carry the data and process evidence it relies on.
export const NAAC_LAYERS = ["L03", "L05", "L06", "L07", "L09", "L14", "L15", "L18", "L20"];
export const NAAC_NOTE =
  "NAAC's revised framework pairs binary accreditation with Maturity-Based Graded Levels (1-5) and relies on digitally validated data. This index reflects the strength of the systems that generate that evidence.";
