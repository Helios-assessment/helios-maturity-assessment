"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthPanel } from "@/components/AuthPanel";
import { useAuth } from "@/components/AuthProvider";
import { SetupNotice } from "@/components/Gate";
import { DOMAINS } from "@/data/domains";
import { LEVELS } from "@/lib/config";
import { LAYERS, TOTAL_DIMENSIONS } from "@/lib/scoring";

export default function Home() {
  const { configured, user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
      <section>
        <p className="eyebrow">For Higher Education Leadership</p>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight">
          How digitally mature is your institution, really?
        </h1>
        <p className="mt-4 text-navy-700">
          The HELIOS™ Digital Maturity Assessment evaluates your institution across{" "}
          <strong>{LAYERS.length} capability layers</strong> and <strong>{TOTAL_DIMENSIONS} dimensions</strong>, groups
          the results into {DOMAINS.length} strategic domains, and produces a board-ready gap analysis with prioritised
          recommendations.
        </p>
        <ul className="mt-5 space-y-2 text-sm text-navy-700">
          <li>• About 15–20 minutes. Progress saves automatically.</li>
          <li>• Instant scores by layer, domain and overall, against an L4 Intelligent target.</li>
          <li>• Downloadable, printable report with strengths, critical gaps and a roadmap.</li>
        </ul>
        <div className="mt-8">
          <p className="eyebrow">Five levels of digital maturity</p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {LEVELS.map((l) => (
              <div key={l.level} className="rounded-lg border border-navy-900/10 bg-white p-3 text-center">
                <div className="font-serif text-2xl font-bold" style={{ color: l.color }}>
                  {l.level}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-navy-700">{l.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section>{configured ? <AuthPanel /> : <SetupNotice />}</section>
    </div>
  );
}
