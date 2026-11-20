"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COUNTRIES, INSTITUTION_SIZES } from "@/data/countries";
import { BRAND } from "@/lib/config";
import { useAuth } from "./AuthProvider";

const phoneOk = (v: string) => /^\+?[0-9][0-9\s\-()]{7,17}$/.test(v.trim()) && v.replace(/\D/g, "").length >= 8;
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function friendly(e: unknown): string {
  const code = (e as { code?: string })?.code || "";
  const map: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists. Please sign in instead.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/user-not-found": "Incorrect email or password.",
    "auth/weak-password": "Password must be at least 8 characters.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "permission-denied": "We could not save your details (permission denied). Please contact support.",
  };
  return map[code] || (e as Error)?.message || "Something went wrong. Please try again.";
}

export function AuthPanel() {
  const { register, login, resetPassword } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [f, setF] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    institutionName: "",
    country: "India",
    institutionSize: "",
    consent: false,
  });
  const set = (k: keyof typeof f, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (mode === "login") {
      if (!emailOk(f.email) || !f.password) return setError("Enter your email and password.");
      setBusy(true);
      try {
        await login(f.email, f.password);
        router.push("/dashboard");
      } catch (err) {
        setError(friendly(err));
      } finally {
        setBusy(false);
      }
      return;
    }
    if (f.fullName.trim().length < 2) return setError("Please enter your full name.");
    if (!emailOk(f.email)) return setError("Please enter a valid work email.");
    if (!phoneOk(f.phone)) return setError("Please enter a valid phone number, including country code (e.g. +91 98765 43210).");
    if (f.institutionName.trim().length < 2) return setError("Please enter your institution name.");
    if (!f.country) return setError("Please select your country.");
    if (!f.institutionSize) return setError("Please select your institution size.");
    if (f.password.length < 8) return setError("Password must be at least 8 characters.");
    if (!f.consent) return setError("Please accept the privacy notice to continue.");
    setBusy(true);
    try {
      await register(f);
      router.push("/dashboard");
    } catch (err) {
      setError(friendly(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="mb-5 flex rounded-md bg-navy-100 p-1 text-sm font-semibold">
        {(["register", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError("");
              setInfo("");
            }}
            className={`flex-1 rounded px-3 py-2 ${mode === m ? "bg-white shadow" : "text-navy-700"}`}
          >
            {m === "register" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {mode === "register" && (
          <>
            <div>
              <label className="label">Full name *</label>
              <input className="input" value={f.fullName} onChange={(e) => set("fullName", e.target.value)} autoComplete="name" />
            </div>
          </>
        )}
        <div>
          <label className="label">Work email *</label>
          <input className="input" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
        </div>
        {mode === "register" && (
          <>
            <div>
              <label className="label">Phone number *</label>
              <input className="input" type="tel" placeholder="+91 98765 43210" value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
            </div>
            <div>
              <label className="label">Institution name *</label>
              <input className="input" value={f.institutionName} onChange={(e) => set("institutionName", e.target.value)} autoComplete="organization" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Country *</label>
                <select className="input" value={f.country} onChange={(e) => set("country", e.target.value)}>
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Institution size *</label>
                <select className="input" value={f.institutionSize} onChange={(e) => set("institutionSize", e.target.value)}>
                  <option value="">Select…</option>
                  {INSTITUTION_SIZES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
        <div>
          <label className="label">Password *</label>
          <input
            className="input"
            type="password"
            value={f.password}
            onChange={(e) => set("password", e.target.value)}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            placeholder={mode === "register" ? "At least 8 characters" : ""}
          />
        </div>

        {mode === "register" && (
          <label className="flex items-start gap-2 text-sm text-navy-700">
            <input type="checkbox" className="mt-1" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} />
            <span>
              I agree that {BRAND.name} may store my details and assessment responses and contact me about my results, as
              described in the{" "}
              <a className="underline" href={BRAND.privacyUrl} target="_blank" rel="noreferrer">
                privacy notice
              </a>
              . *
            </span>
          </label>
        )}

        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {info && <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-800">{info}</p>}

        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "register" ? "Create account & start assessment" : "Sign in"}
        </button>

        {mode === "login" && (
          <button
            type="button"
            className="w-full text-center text-xs text-navy-700 underline"
            onClick={async () => {
              setError("");
              if (!emailOk(f.email)) return setError("Enter your email above first.");
              try {
                await resetPassword(f.email);
                setInfo("Password reset email sent.");
              } catch (err) {
                setError(friendly(err));
              }
            }}
          >
            Forgot password?
          </button>
        )}
      </form>
    </div>
  );
}
