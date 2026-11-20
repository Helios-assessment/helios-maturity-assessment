// Level descriptors shown beside each question. The wording is templated per dimension;
// add an entry to DIMENSION_OVERRIDES to give any single dimension bespoke descriptors.
export const LEVEL_NAMES = ["Fragmented", "Enabled", "Integrated", "Intelligent", "Autonomous"] as const;

export function levelDescriptors(dim: string): string[] {
  const o = DIMENSION_OVERRIDES[dim];
  if (o) return o;
  return [
    `${dim} is handled manually or through isolated tools and spreadsheets. There is no clear owner, standard process or institutional policy.`,
    `Dedicated systems cover parts of ${dim}, but they are departmental, only partly integrated and used inconsistently.`,
    `${dim} runs on integrated platforms with defined processes and ownership. Data flows across departments and results are reported regularly.`,
    `${dim} is data-driven: analytics and AI support decisions and personalisation, performance is tracked against KPIs, and improvement is continuous.`,
    `${dim} is largely orchestrated by AI and agentic automation under human oversight. It self-optimises and delivers measurable institutional impact.`,
  ];
}

export const questionText = (dim: string) =>
  `How mature is your institution's digital capability in "${dim}"?`;

export const DIMENSION_OVERRIDES: Record<string, string[]> = {};
