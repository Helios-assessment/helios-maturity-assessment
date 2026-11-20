// Central scoring configuration. Edit here to change weights, targets or tier bands.

/** Fixed target maturity level (1-5) used as the baseline for every layer: L4 Intelligent. */
export const TARGET_LEVEL = 4;

/** Per-layer weights (default 1 = equal). Domain scores are the weighted mean of their layers;
 *  the overall score is the weighted mean of all layers. */
export const LAYER_WEIGHTS: Record<string, number> = {};

export interface Level {
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
  stage: string;
  description: string;
  color: string;
  /** Inclusive lower bound of the 0-100 composite score for this tier. */
  min: number;
}

export const LEVELS: Level[] = [
  {
    level: 1,
    name: "Fragmented",
    stage: "Reactive Digital",
    description:
      "Siloed systems and manual processes. Technology is adopted reactively, with no institution-wide digital strategy.",
    color: "#b4452f",
    min: 0,
  },
  {
    level: 2,
    name: "Enabled",
    stage: "Departmental Digital",
    description:
      "Core systems exist in most functions, but they run in departmental silos with limited integration and uneven adoption.",
    color: "#d4892a",
    min: 25,
  },
  {
    level: 3,
    name: "Integrated",
    stage: "Connected Digital",
    description:
      "Cross-functional digital operations are in place and producing measurable value. Priority: deepen data integration and strengthen predictive analytics.",
    color: "#b09a2c",
    min: 50,
  },
  {
    level: 4,
    name: "Intelligent",
    stage: "Data-Driven Digital",
    description:
      "Analytics and AI inform decisions and personalise services across the institution, with KPIs tracked at board level.",
    color: "#4a8a5c",
    min: 70,
  },
  {
    level: 5,
    name: "Autonomous",
    stage: "AI-Native Digital",
    description:
      "Agentic AI orchestrates large parts of operations under human oversight; the institution self-optimises against its outcomes.",
    color: "#2a6f8f",
    min: 85,
  },
];

export const BRAND = {
  name: "MIRAKI23 LLP",
  product: "HELIOS™ Digital Maturity Assessment",
  website: "https://www.miraki23.com",
  privacyUrl: "https://miraki23.com/privacy-policy/",
  meetingUrl: "https://meetings-na2.hubspot.com/miraki",
  copyright: "HELIOS Framework™ © MIRAKI23 LLP. All rights reserved.",
};
