"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Gate } from "@/components/Gate";
import { createAssessment, listMyAssessments } from "@/lib/assessments";
import { computeScores, TOTAL_DIMENSIONS } from "@/lib/scoring";
import type { AssessmentDoc } from "@/lib/types";

const fmt = (t?: { toDate?: () => Date } | null) =>
  t?.toDate ? t.toDate().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

function Dashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<AssessmentDoc[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    listMyAssessments(user.uid)
      .then(setItems)
      .catch(() => setError("Could not load your assessments. Please refresh."));
  }, [user]);

  async function start() {
    if (!user || !profile) return;
    setBusy(true);
    try {
      const id = await createAssessment(user.uid, profile);
      router.push(`/assessment?id=${id}`);
    } catch {
      setError("Could not start a new assessment. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Welcome{profile ? `, ${profile.fullName.split(" ")[0]}` : ""}</p>
          <h1 className="font-serif text-3xl font-bold">Your assessments</h1>
          {profile && <p className="mt-1 text-sm text-navy-700">{profile.institutionName}</p>}
        </div>
        <button className="btn btn-gold" onClick={start} disabled={busy || !profile}>
          {busy ? "Creating…" : "Start a new assessment"}
        </button>
      </div>

      {!profile && items && (
        <p className="mt-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Your institution profile was not found. Please contact support or register again.
        </p>
      )}
      {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 space-y-3">
        {items === null && !error && <p className="text-sm text-navy-700">Loading…</p>}
        {items?.length === 0 && (
          <div className="card text-sm text-navy-700">
            You have not started an assessment yet. Press <strong>Start a new assessment</strong> to begin. It takes
            about 15–20 minutes and saves as you go.
          </div>
        )}
        {items?.map((a) => {
          const s = computeScores(a.responses || {});
          const done = a.status === "completed";
          return (
            <div key={a.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                      done ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {done ? "Completed" : "In progress"}
                  </span>
                  <span className="text-sm text-navy-700">Started {fmt(a.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm">
                  {s.answered}/{TOTAL_DIMENSIONS} dimensions answered
                  {done && s.overallPct !== null && s.level && (
                    <>
                      {" "}
                      · Score <strong>{Math.round(s.overallPct)}/100</strong> · L{s.level.level} {s.level.name}
                    </>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                {!done && (
                  <Link className="btn btn-primary" href={`/assessment?id=${a.id}`}>
                    Resume
                  </Link>
                )}
                {done && (
                  <>
                    <Link className="btn btn-primary" href={`/report?id=${a.id}`}>
                      View report
                    </Link>
                    <Link className="btn btn-ghost" href={`/assessment?id=${a.id}`}>
                      Edit answers
                    </Link>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Dashboard />
    </Gate>
  );
}
