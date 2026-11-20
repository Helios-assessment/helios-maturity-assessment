"use client";

import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Gate } from "@/components/Gate";
import { DOMAINS } from "@/data/domains";
import { downloadCsv, toCsv } from "@/lib/csv";
import { getFirebase } from "@/lib/firebase";
import { LAYERS } from "@/lib/scoring";
import type { AssessmentDoc, LeadProfile } from "@/lib/types";

type TS = { toDate?: () => Date } | null | undefined;
const iso = (t: TS) => (t?.toDate ? t.toDate().toISOString() : "");
const ms = (t: TS) => (t?.toDate ? t.toDate().getTime() : 0);

function Admin() {
  const [leads, setLeads] = useState<LeadProfile[] | null>(null);
  const [assessments, setAssessments] = useState<AssessmentDoc[]>([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const { db } = getFirebase();
    Promise.all([getDocs(collection(db, "leads")), getDocs(collection(db, "assessments"))])
      .then(([l, a]) => {
        setLeads(l.docs.map((d) => d.data() as LeadProfile).sort((x, y) => ms(y.createdAt) - ms(x.createdAt)));
        setAssessments(a.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AssessmentDoc, "id">) })));
      })
      .catch(() => setError("Could not load data. Check that your email is in firestore.rules and NEXT_PUBLIC_ADMIN_EMAILS."));
  }, []);

  const latestByUid = useMemo(() => {
    const m = new Map<string, AssessmentDoc>();
    for (const a of assessments) {
      const cur = m.get(a.uid);
      if (!cur || ms(a.createdAt) > ms(cur.createdAt)) m.set(a.uid, a);
    }
    return m;
  }, [assessments]);
  const countByUid = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of assessments) m.set(a.uid, (m.get(a.uid) || 0) + 1);
    return m;
  }, [assessments]);

  const filtered = (leads || []).filter((l) =>
    `${l.fullName} ${l.email} ${l.institutionName} ${l.country}`.toLowerCase().includes(q.toLowerCase()),
  );

  function exportLeads() {
    const head = ["Registered (UTC)", "Full name", "Email", "Phone", "Institution", "Country", "Size", "Consent", "Consent time (UTC)", "Assessments", "Latest status", "Latest score", "Latest level", "Latest report id"];
    const rows = (leads || []).map((l) => {
      const a = latestByUid.get(l.uid);
      return [iso(l.createdAt), l.fullName, l.email, l.phone, l.institutionName, l.country, l.institutionSize, l.consentAccepted ? "Yes" : "No", iso(l.consentAt), countByUid.get(l.uid) || 0, a?.status ?? "", a?.scores?.overallPct ?? "", a?.scores?.levelName ?? "", a?.id ?? ""];
    });
    downloadCsv(`helios-leads-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([head, ...rows]));
  }

  function exportAssessments() {
    const head = ["Assessment id", "Started (UTC)", "Completed (UTC)", "Status", "Full name", "Email", "Phone", "Institution", "Country", "Size", "Overall score", "Level", ...DOMAINS.map((d) => `${d.id} ${d.name}`), ...LAYERS.map((l) => `${l.id} ${l.name}`)];
    const rows = assessments
      .sort((x, y) => ms(y.createdAt) - ms(x.createdAt))
      .map((a) => [a.id, iso(a.createdAt), iso(a.completedAt), a.status, a.lead?.fullName, a.lead?.email, a.lead?.phone, a.lead?.institutionName, a.lead?.country, a.lead?.institutionSize, a.scores?.overallPct ?? "", a.scores?.levelName ?? "", ...DOMAINS.map((d) => a.scores?.domains?.[d.id] ?? ""), ...LAYERS.map((l) => a.scores?.layers?.[l.id] ?? "")]);
    downloadCsv(`helios-assessments-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([head, ...rows]));
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="font-serif text-3xl font-bold">Leads &amp; assessments</h1>
          <p className="text-sm text-navy-700">
            {leads?.length ?? "…"} leads · {assessments.length} assessments ({assessments.filter((a) => a.status === "completed").length} completed)
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-gold" onClick={exportLeads} disabled={!leads}>Export leads CSV</button>
          <button className="btn btn-ghost" onClick={exportAssessments} disabled={!leads}>Export assessments CSV</button>
        </div>
      </div>
      {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <input className="input mt-5 max-w-sm" placeholder="Search name, email, institution…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-left text-xs">
          <thead className="bg-navy-100 uppercase tracking-wider text-navy-700">
            <tr>
              {["Registered", "Name", "Email", "Phone", "Institution", "Country", "Size", "Status", "Score", "Report"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const a = latestByUid.get(l.uid);
              return (
                <tr key={l.uid} className="border-t border-navy-900/5">
                  <td className="whitespace-nowrap px-3 py-2">{l.createdAt?.toDate ? l.createdAt.toDate().toLocaleDateString() : "—"}</td>
                  <td className="px-3 py-2 font-semibold">{l.fullName}</td>
                  <td className="px-3 py-2">{l.email}</td>
                  <td className="whitespace-nowrap px-3 py-2">{l.phone}</td>
                  <td className="px-3 py-2">{l.institutionName}</td>
                  <td className="px-3 py-2">{l.country}</td>
                  <td className="whitespace-nowrap px-3 py-2">{l.institutionSize}</td>
                  <td className="px-3 py-2">{a ? a.status : "none"}</td>
                  <td className="whitespace-nowrap px-3 py-2">{a?.scores?.overallPct != null ? `${Math.round(a.scores.overallPct)} · ${a.scores.levelName}` : "—"}</td>
                  <td className="px-3 py-2">{a ? <Link className="underline" href={`/report?id=${a.id}`}>Open</Link> : ""}</td>
                </tr>
              );
            })}
            {leads && filtered.length === 0 && (
              <tr><td colSpan={10} className="px-3 py-6 text-center text-navy-700">No leads found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Gate admin>
      <Admin />
    </Gate>
  );
}
