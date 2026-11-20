"use client";

import { DomainRadar, Heatmap, LayerBars, LayerRadar } from "@/components/Charts";
import { LEVELS, BRAND, TARGET_LEVEL } from "@/lib/config";
import { prioritise, regulatory, strengthsAndGaps } from "@/lib/report";
import { computeScores, TARGET_PCT, TOTAL_DIMENSIONS } from "@/lib/scoring";
import { NAAC_NOTE } from "@/data/regulatory";
import type { AssessmentDoc } from "@/lib/types";

const pct = (v: number | null) => (v === null ? "–" : String(Math.round(v)));
const fmtDate = (a: AssessmentDoc) => {
  const t = a.completedAt || a.updatedAt || a.createdAt;
  return t?.toDate ? t.toDate().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";
};

function Bar({ value, color }: { value: number | null; color: string }) {
  return (
    <div className="relative h-3 w-full rounded bg-navy-100">
      <div className="h-3 rounded" style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%`, background: color }} />
      <div className="absolute top-[-2px] h-[16px] w-[2px] bg-[#b4452f]" style={{ left: `${TARGET_PCT}%` }} title="Target" />
    </div>
  );
}

export function ReportView({ a }: { a: AssessmentDoc }) {
  const r = a.responses || {};
  const s = computeScores(r);
  const { strengths, gaps } = strengthsAndGaps(s);
  const priorities = prioritise(s, r);
  const reg = regulatory(s);
  const lvl = s.level;
  const date = fmtDate(a);

  return (
    <article id="report-root" className="space-y-6 text-[14px] leading-relaxed">
      {/* Cover / headline */}
      <section className="card print-avoid-break">
        <p className="eyebrow">HELIOS™ Digital Maturity Assessment · Gap Analysis Report</p>
        <h1 className="mt-2 font-serif text-4xl font-bold">{a.lead.institutionName}</h1>
        <p className="mt-1 text-sm text-navy-700">
          Prepared for {a.lead.fullName}
          {date && <> · {date}</>} · {s.answered}/{TOTAL_DIMENSIONS} dimensions assessed
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="rounded-lg border border-navy-900/10 p-5 text-center">
            <p className="eyebrow">HELIOS Composite Score™</p>
            <p className="font-serif text-6xl font-bold text-gold-600">{pct(s.overallPct)}</p>
            <p className="text-xs text-navy-700">out of 100</p>
            {lvl && (
              <p className="mt-2 text-sm font-bold uppercase tracking-wider" style={{ color: lvl.color }}>
                Level {lvl.level}: {lvl.name}
              </p>
            )}
            <p className="mt-1 text-[11px] text-navy-700">Target: {TARGET_PCT}/100 (L{TARGET_LEVEL} {LEVELS[TARGET_LEVEL - 1].name})</p>
          </div>
          <div>
            <div className="grid grid-cols-5 gap-2">
              {LEVELS.map((l) => (
                <div
                  key={l.level}
                  className="rounded-lg border p-2 text-center"
                  style={{ borderColor: lvl?.level === l.level ? l.color : "#e3e6ee", background: lvl?.level === l.level ? `${l.color}1a` : "#fff" }}
                >
                  <div className="font-serif text-xl font-bold" style={{ color: l.color }}>
                    {l.level}
                  </div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider">{l.name}</div>
                </div>
              ))}
            </div>
            {lvl && (
              <p className="mt-3 text-navy-700">
                <strong style={{ color: lvl.color }}>{lvl.stage}.</strong> {lvl.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Profile */}
      <section className="card print-avoid-break">
        <h2 className="font-serif text-xl font-bold">Institution profile</h2>
        <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {[
            ["Institution", a.lead.institutionName],
            ["Country", a.lead.country],
            ["Size", a.lead.institutionSize],
            ["Respondent", a.lead.fullName],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wider text-navy-700">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Domains */}
      <section className="card print-avoid-break">
        <h2 className="font-serif text-xl font-bold">Maturity by strategic domain</h2>
        <div className="mt-4 grid items-center gap-6 md:grid-cols-[440px_1fr]">
          <div className="overflow-x-auto"><DomainRadar scores={s} /></div>
          <div className="space-y-3">
            {s.domains.map((d) => (
              <div key={d.id}>
                <div className="flex justify-between text-sm">
                  <span>
                    <strong>{d.id}</strong> {d.name}
                  </span>
                  <span className="font-semibold">{pct(d.pct)}%</span>
                </div>
                <Bar value={d.pct} color="#a97c22" />
              </div>
            ))}
            <p className="text-[11px] text-navy-700">Red marker = target ({TARGET_PCT}%).</p>
          </div>
        </div>
      </section>

      {/* Layers */}
      <section className="card print-avoid-break">
        <h2 className="font-serif text-xl font-bold">Maturity by capability layer: current vs target</h2>
        <div className="mt-4 overflow-x-auto"><LayerBars scores={s} /></div>
        <div className="mt-2 grid items-center gap-6 md:grid-cols-[440px_1fr]">
          <div className="overflow-x-auto"><LayerRadar scores={s} /></div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left uppercase tracking-wider text-navy-700">
                <th className="py-1">Layer</th>
                <th className="py-1 text-right">Score</th>
                <th className="py-1 text-right">Level</th>
                <th className="py-1 text-right">Gap</th>
              </tr>
            </thead>
            <tbody>
              {s.layers.map((l) => (
                <tr key={l.id} className="border-b border-navy-900/5">
                  <td className="py-1">
                    <strong>{l.id}</strong> {l.name}
                  </td>
                  <td className="py-1 text-right">{pct(l.pct)}</td>
                  <td className="py-1 text-right">{l.avg === null ? "–" : l.avg.toFixed(1)}</td>
                  <td className="py-1 text-right" style={{ color: (l.gap ?? 0) > 1.5 ? "#b4452f" : undefined }}>
                    {l.gap === null ? "–" : l.gap.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Heatmap */}
      <section className="card print-avoid-break">
        <h2 className="font-serif text-xl font-bold">Dimension heatmap</h2>
        <p className="mb-3 text-xs text-navy-700">Each cell is one dimension (maturity level 1–5); rows are layers.</p>
        <Heatmap responses={r} />
      </section>

      {/* Strengths and gaps */}
      <section className="grid gap-6 md:grid-cols-2 print-avoid-break">
        <div className="card">
          <h2 className="font-serif text-xl font-bold text-green-800">Strengths: top-performing layers</h2>
          <ol className="mt-3 space-y-2">
            {strengths.map((l) => (
              <li key={l.id} className="flex justify-between gap-3 border-b border-navy-900/5 pb-1">
                <span>
                  <strong>{l.id}</strong> {l.name}
                </span>
                <span className="font-semibold">{pct(l.pct)}%</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="card">
          <h2 className="font-serif text-xl font-bold text-red-800">Critical gaps: lowest-scoring layers</h2>
          <ol className="mt-3 space-y-2">
            {gaps.map((l) => (
              <li key={l.id} className="flex justify-between gap-3 border-b border-navy-900/5 pb-1">
                <span>
                  <strong>{l.id}</strong> {l.name}
                </span>
                <span className="font-semibold">{pct(l.pct)}%</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Recommendations */}
      <section className="card">
        <h2 className="font-serif text-xl font-bold">Prioritised recommendations</h2>
        <p className="mt-1 text-xs text-navy-700">
          Ranked by distance to the L{TARGET_LEVEL} target (weighted by layer importance). The three largest gaps are
          scheduled first.
        </p>
        <div className="mt-4 space-y-3">
          {priorities.length === 0 && <p>All assessed layers meet the target. Focus on sustaining and scaling your advantage.</p>}
          {priorities.map((p) => (
            <div key={p.layerId} className="print-avoid-break rounded-lg border border-navy-900/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-xs text-white">{p.rank}</span>
                  {p.layerId} · {p.layerName}
                </h3>
                <span className="rounded bg-gold-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold-700">{p.horizon}</span>
              </div>
              <p className="mt-1 text-xs text-navy-700">
                {p.domainName} · Current L{p.avg.toFixed(1)} → target L{TARGET_LEVEL} (gap {p.gap.toFixed(1)}) · <strong>{p.stage}</strong>
              </p>
              <p className="mt-2">{p.text}</p>
              {p.focus.length > 0 && (
                <p className="mt-1 text-xs text-navy-700">
                  <strong>Start with:</strong> {p.focus.join("; ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Regulatory readiness */}
      <section className="card print-avoid-break">
        <h2 className="font-serif text-xl font-bold">Regulatory digital-readiness lens</h2>
        <p className="mt-1 text-xs text-navy-700">
          Indicative only. This shows how well your digital capability supports the evidence regulators measure. It is not a
          predicted NIRF score or NAAC grade.
        </p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold">NIRF parameters</h3>
            <p className="font-serif text-3xl font-bold text-gold-600">
              {pct(reg.nirf)}
              <span className="text-sm text-navy-700"> / 100 readiness</span>
            </p>
            <table className="mt-2 w-full text-xs">
              <tbody>
                {reg.params.map((p) => (
                  <tr key={p.code} className="border-b border-navy-900/5">
                    <td className="py-1">
                      <strong>{p.code}</strong> {p.name} <span className="text-navy-700">(weight {p.weight})</span>
                    </td>
                    <td className="py-1 text-right font-semibold">{pct(p.pct)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="font-semibold">NAAC data-evidence readiness</h3>
            <p className="font-serif text-3xl font-bold text-gold-600">
              {pct(reg.naac)}
              <span className="text-sm text-navy-700"> / 100 · {reg.naacLevel ? `L${reg.naacLevel.level} ${reg.naacLevel.name}` : ""}</span>
            </p>
            <p className="mt-2 text-xs text-navy-700">{NAAC_NOTE}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="card print-avoid-break bg-navy-900 text-white">
        <h2 className="font-serif text-xl font-bold">Turn this report into a board-ready roadmap</h2>
        <p className="mt-2 text-sm text-white/80">
          The full HELIOS Audit adds stakeholder interviews, a system and data review, a 25+ indicator board KPI framework
          and a 12–36 month transformation roadmap.
        </p>
        <p className="mt-3 text-sm">
          Book a leadership conversation:{" "}
          <a className="font-semibold text-gold-300 underline" href={BRAND.meetingUrl}>
            {BRAND.meetingUrl}
          </a>{" "}
          · <a className="text-gold-300 underline" href={BRAND.website}>{BRAND.website}</a>
        </p>
      </section>

      <p className="text-center text-[11px] text-navy-700">
        {BRAND.copyright} Scores are self-assessed and indicative. Level bands: L1 0–24, L2 25–49, L3 50–69, L4 70–84, L5 85–100.
      </p>
    </article>
  );
}
