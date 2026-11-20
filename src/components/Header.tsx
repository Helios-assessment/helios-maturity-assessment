"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function Header() {
  const { user, isAdmin, logout } = useAuth();
  return (
    <header className="no-print border-b border-navy-900/10 bg-navy-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-xl font-bold tracking-wide">HELIOS™</span>
          <span className="hidden text-[11px] uppercase tracking-[0.2em] text-gold-300 sm:inline">
            Digital Maturity Assessment · MIRAKI23
          </span>
        </Link>
        {user && (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="hover:text-gold-300">
              My assessments
            </Link>
            {isAdmin && (
              <Link href="/admin" className="hover:text-gold-300">
                Admin
              </Link>
            )}
            <button onClick={() => logout()} className="rounded border border-white/30 px-3 py-1 hover:bg-white/10">
              Sign out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
