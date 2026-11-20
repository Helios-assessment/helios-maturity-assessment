"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Gate } from "@/components/Gate";
import { completeAssessment, getAssessment, saveResponses } from "@/lib/assessments";
import { LEVELS } from "@/lib/config";
import { LEVEL_NAMES, levelDescriptors, questionText } from "@/data/rubric";
import { computeScores, domainOfLayer, LAYERS, TOTAL_DIMENSIONS, type Responses } from "@/lib/scoring";

type SaveState = "idle" | "saving" | "saved" | "error";

function Wizard() {
  const params = useSearchParams();
  const id = params.get("id");
  const router = useRouter();
  const { user } = useAuth();
  const [responses, setResponses] = useState<Responses | null>(null);
  const [step, setStep] = useState(0);
  const [save, setSave] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const [finishing, setFinishing] = useState(false);
  const dirty = useRef(false);
  const latest = useRef<Responses>({});

  // Load: Firestore is the source of truth; a newer local backup (offline/failed save) wins.
  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      try {
        const a = await getAssessment(id);
        if (!a || a.uid !== user.uid) return setError("Assessment not found.");
        let r = a.responses || {};
        try {
          const local = JSON.parse(localStorage.getItem(`helios:${id}`) || "null");
          if (local && Object.keys(local).length > Object.keys(r).length) {
            r = local;
            dirty.current = true;
          }
          const s = Number(localStorage.getItem(`helios:${id}:step`));
          if (Number.isInteger(s) && s >= 0 && s < LAYERS.length) setStep(s);
        } catch {}
        latest.current = r;
        setResponses(r);
      } catch {
        setError("Could not load this assessment.");
      }
    })();
  }, [id, user]);

  const persist = useCallback(async () => {
    if (!id || !dirty.current) return;
    setSave("saving");
    try {
      await saveResponses(id, latest.current);
      dirty.current = false;
      setSave("saved");
    } catch {
      setSave("error");
    }
  }, [id]);

  // Debounced auto-save + local backup.
  useEffect(() => {
    if (!responses || !id) return;
    try {
      localStorage.setItem(`helios:${id}`, JSON.stringify(responses));
    } catch {}
    if (!dirty.current) return;
    const t = setTimeout(persist, 900);
    return () => clearTimeout(t);
  }, [responses, id, persist]);

  useEffect(() => {
    if (id) {
      try {
        localStorage.setItem(`helios:${id}:step`, String(step));
      } catch {}
    }
  }, [id, step]);

  const scores = useMemo(() => computeScores(responses || {}), [responses]);

  if (!id) return <p className="text-sm">No assessment selected.</p>;
  if (error) return <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  if (!responses) return <p className="py-16 text-center text-sm text-navy-700">Loading assessment…</p>;

  const layer = LAYERS[step];
  const domain = domainOfLayer(layer.id);

  const answer = (dimId: string, v: number) => {
    dirty.current = true;
    const next = { ...latest.current, [dimId]: v };
    latest.current = next;
    setResponses(next);
  };

  async function finish() {
    if (!user || !id) return;
    setFinishing(true);
    try {
      await completeAssessment(id, user.uid, latest.current);
      try {
        localStorage.removeItem(`helios:${id}`);
      } catch {}
      router.push(`/report?id=${id}`);
    } catch {
      setError("Could not finalise your assessment. Your answers are saved; please try again.");
      setFinishing(false);
    }
  }

  const unanswered = LAYERS.filter((l) => l.dimensions.some((d) => responses[d.id] === undefined));
  const pctDone = Math.round((scores.answered / TOTAL_DIMENSIONS) * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-4 lg:self-start">
        <div className="card p-4">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow">Live score</span>
            <span className="text-[11px] text-navy-700">
              {save === "saving" && "Saving…"}
              {save === "saved" && "✓ Saved"}
              {save === "error" && <span className="text-red-600">Not saved – retrying on next change</span>}
            </span>
          </div>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-serif text-4xl font-bold text-gold-600">
              {scores.overallPct === null ? "–" : Math.round(scores.overallPct)}
            </span>
            <span className="pb-1 text-xs text-navy-700">/ 100</span>
          </div>
          <p className="text-xs font-semibold" style={{ color: scores.level?.color }}>
            {scores.level ? `L${scores.level.level} ${scores.level.name}` : "Answer to see your level"}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded bg-navy-100">
            <div className="h-full bg-gold-500 transition-all" style={{ width: `${pctDone}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-navy-700">
            {scores.answered}/{TOTAL_DIMENSIONS} answered
          </p>
        </div>
        <nav className="card mt-4 max-h-[55vh] overflow-y-auto p-2">
          {LAYERS.map((l, i) => {
            const ls = scores.layers[i];
            const complete = ls.answered === ls.total;
            return (
              <button
                key={l.id}
                onClick={() => setStep(i)}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs ${
                  i === step ? "bg-navy-900 text-white" : "hover:bg-navy-100"
                }`}
              >
                <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${complete ? "bg-green-500" : ls.answered ? "bg-amber-400" : "bg-navy-900/20"}`} />
                <span className="font-semibold">{l.id}</span>
                <span className="truncate">{l.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Question area */}
      <section>
        <p className="eyebrow">
          {domain.id} · {domain.name}
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold">
          Layer {String(layer.number).padStart(2, "0")} · {layer.name}
        </h1>
        <p className="mt-1 text-sm text-navy-700">
          Step {step + 1} of {LAYERS.length}. Choose the description that best matches your institution today.
        </p>

        <div className="mt-5 space-y-5">
          {layer.dimensions.map((dim) => {
            const desc = levelDescriptors(dim.name);
            const val = responses[dim.id];
            return (
              <div key={dim.id} className="card">
                <h2 className="font-semibold">{questionText(dim.name)}</h2>
                <p className="mt-2 text-xs text-navy-700">
                  <span className="font-semibold">Includes:</span> {dim.capabilities.join(" · ")}
                </p>
                <div className="mt-4 space-y-2">
                  {desc.map((d, i) => {
                    const lvl = i + 1;
                    const on = val === lvl;
                    return (
                      <label
                        key={lvl}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
                          on ? "border-gold-500 bg-gold-100" : "border-navy-900/10 hover:bg-navy-100/60"
                        }`}
                      >
                        <input type="radio" name={dim.id} className="mt-1" checked={on} onChange={() => answer(dim.id, lvl)} />
                        <span>
                          <span className="font-semibold" style={{ color: LEVELS[i].color }}>
                            L{lvl} {LEVEL_NAMES[i]}
                          </span>
                          <span className="block text-navy-700">{d}</span>
                        </span>
                      </label>
                    );
                  })}
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${
                      val === 0 ? "border-gold-500 bg-gold-100" : "border-dashed border-navy-900/20 hover:bg-navy-100/60"
                    }`}
                  >
                    <input type="radio" name={dim.id} checked={val === 0} onChange={() => answer(dim.id, 0)} />
                    <span className="text-navy-700">Not applicable to our institution (excluded from scoring)</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button className="btn btn-ghost" disabled={step === 0} onClick={() => { setStep(step - 1); window.scrollTo({ top: 0 }); }}>
            ← Previous
          </button>
          {step < LAYERS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => { persist(); setStep(step + 1); window.scrollTo({ top: 0 }); }}>
              Next layer →
            </button>
          ) : (
            <button className="btn btn-gold" disabled={!scores.complete || finishing} onClick={finish}>
              {finishing ? "Generating…" : "Complete & view report"}
            </button>
          )}
        </div>

        {step === LAYERS.length - 1 && !scores.complete && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Answer every dimension to generate the report. Still open:
            <div className="mt-2 flex flex-wrap gap-2">
              {unanswered.map((l) => (
                <button key={l.id} className="rounded bg-white px-2 py-1 text-xs font-semibold underline" onClick={() => setStep(LAYERS.indexOf(l))}>
                  {l.id} {l.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Suspense fallback={<p className="py-16 text-center text-sm">Loading…</p>}>
        <Wizard />
      </Suspense>
    </Gate>
  );
}
