"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ADMIN_EMAILS, getFirebase, isFirebaseConfigured } from "@/lib/firebase";
import { getProfile } from "@/lib/assessments";
import type { LeadProfile } from "@/lib/types";

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  institutionName: string;
  country: string;
  institutionSize: string;
}

interface AuthCtx {
  configured: boolean;
  loading: boolean;
  user: User | null;
  profile: LeadProfile | null;
  verified: boolean;
  isAdmin: boolean;
  register: (i: RegisterInput) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);
export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<LeadProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const { auth } = getFirebase();
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          setProfile(await getProfile(u.uid));
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const register = useCallback(async (i: RegisterInput) => {
    const { auth, db } = getFirebase();
    const cred = await createUserWithEmailAndPassword(auth, i.email.trim(), i.password);
    await updateProfile(cred.user, { displayName: i.fullName.trim() });
    const lead = {
      uid: cred.user.uid,
      fullName: i.fullName.trim(),
      email: i.email.trim().toLowerCase(),
      phone: i.phone.trim(),
      institutionName: i.institutionName.trim(),
      country: i.country,
      institutionSize: i.institutionSize,
      consentAccepted: true,
      consentAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      source: "helios-assessment-tool",
    };
    await setDoc(doc(db, "leads", cred.user.uid), lead);
    await sendEmailVerification(cred.user);
    setProfile(await getProfile(cred.user.uid));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { auth } = getFirebase();
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const logout = useCallback(async () => {
    await signOut(getFirebase().auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(getFirebase().auth, email.trim());
  }, []);

  const resendVerification = useCallback(async () => {
    const u = getFirebase().auth.currentUser;
    if (u) await sendEmailVerification(u);
  }, []);

  const refresh = useCallback(async () => {
    const u = getFirebase().auth.currentUser;
    if (u) {
      await u.reload();
      await u.getIdToken(true); // pick up email_verified in the token so Firestore rules see it
      setUser(u);
      setTick((t) => t + 1);
    }
  }, []);

  const verified = Boolean(user?.emailVerified);
  const isAdmin = verified && !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  const value = useMemo<AuthCtx>(
    () => ({
      configured: isFirebaseConfigured,
      loading,
      user,
      profile,
      verified,
      isAdmin,
      register,
      login,
      logout,
      resetPassword,
      resendVerification,
      refresh,
    }),
    [loading, user, profile, verified, isAdmin, register, login, logout, resetPassword, resendVerification, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
