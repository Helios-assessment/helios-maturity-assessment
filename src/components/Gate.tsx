"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

/** Protects a page: requires sign-in and a verified email (and optionally admin). */
export function Gate({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { configured, loading, user, verified, isAdmin, resendVerification, refresh, logout } = useAuth();
  const router = useRouter();
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/");
  }, [loading, configured, user, router]);

  if (!configured) return <SetupNotice />;
  if (loading || !user) return <p className="py-20 text-center text-sm text-navy-700">Loading…</p>;

  if (!verified) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <p className="eyebrow">One more step</p>
        <h1 className="mt-2 font-serif text-2xl font-bold">Verify your email</h1>
        <p className="mt-3 text-sm text-navy-700">
          We sent a verification link to <strong>{user.email}</strong>. Open it, then come back and press the button
          below. Check your spam folder if you cannot find it.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            className="btn btn-primary"
            onClick={async () => {
              await refresh();
              setMsg("");
            }}
          >
            I have verified my email
          </button>
          <button
            className="btn btn-ghost"
            onClick={async () => {
              try {
                await resendVerification();
                setMsg("Verification email sent again.");
              } catch {
                setMsg("Please wait a minute before requesting another email.");
              }
            }}
          >
            Resend email
          </button>
          <button className="btn btn-ghost" onClick={() => logout()}>
            Sign out
          </button>
        </div>
        {msg && <p className="mt-3 text-sm text-gold-700">{msg}</p>}
      </div>
    );
  }

  if (admin && !isAdmin) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <h1 className="font-serif text-2xl font-bold">Admin access only</h1>
        <p className="mt-2 text-sm text-navy-700">Your account is not on the administrator list.</p>
        <Link href="/dashboard" className="btn btn-primary mt-4">
          Back to my assessments
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}

export function SetupNotice() {
  return (
    <div className="card mx-auto max-w-xl">
      <h1 className="font-serif text-xl font-bold">Firebase is not configured</h1>
      <p className="mt-2 text-sm text-navy-700">
        This build has no Firebase keys. Copy <code>.env.example</code> to <code>.env.local</code> for local work, or add
        the <code>NEXT_PUBLIC_FIREBASE_*</code> GitHub Secrets for deployment. See the README.
      </p>
    </div>
  );
}
