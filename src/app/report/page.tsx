"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Gate } from "@/components/Gate";
import { ReportView } from "@/components/ReportView";
import { getAssessment } from "@/lib/assessments";
import type { AssessmentDoc } from "@/lib/types";

/** Builds a self-contained HTML file: report markup + all loaded CSS. */
function downloadHtml(title: string) {
  const root = document.getElementById("report-root");
  if (!root) return;
  let css = "";
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      css += Array.from(sheet.cssRules).map((r) => r.cssText).join("\n");
    } catch {}
  }
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}</style></head><body><main style="max-width:1100px;margin:0 auto;padding:24px">${root.outerHTML}</main></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function Report() {
  const id = useSearchParams().get("id");
  const { user, isAdmin } = useAuth();
  const [a, setA] = useState<AssessmentDoc | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !user) return;
    getAssessment(id)
      .then((d) => {
        if (!d || (d.uid !== user.uid && !isAdmin)) setError("Report not found.");
        else setA(d);
      })
      .catch(() => setError("Could not load this report."));
  }, [id, user, isAdmin]);

  if (!id) return <p className="text-sm">No report selected.</p>;
  if (error) return <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  if (!a) return <p className="py-16 text-center text-sm text-navy-700">Preparing your report…</p>;

  const title = `HELIOS Gap Analysis - ${a.lead.institutionName}`;
  return (
    <div>
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className="text-sm underline">
          ← My assessments
        </Link>
        <div className="flex flex-wrap gap-2">
          {a.status !== "completed" && (
            <span className="rounded bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800">Draft: assessment not yet completed</span>
          )}
          <button className="btn btn-primary" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
          <button className="btn btn-ghost" onClick={() => downloadHtml(title)}>
            Download HTML
          </button>
        </div>
      </div>
      <ReportView a={a} />
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Suspense fallback={<p className="py-16 text-center text-sm">Loading…</p>}>
        <Report />
      </Suspense>
    </Gate>
  );
}
