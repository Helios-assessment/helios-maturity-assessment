import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebase } from "./firebase";
import { computeScores, type Responses } from "./scoring";
import type { AssessmentDoc, LeadProfile, ScoreSummary } from "./types";

const millis = (t: { toMillis?: () => number } | null | undefined) => (t?.toMillis ? t.toMillis() : 0);

export function summarise(responses: Responses): ScoreSummary {
  const s = computeScores(responses);
  return {
    overallPct: s.overallPct,
    overallAvg: s.overallAvg === null ? null : Math.round(s.overallAvg * 100) / 100,
    levelName: s.level ? `L${s.level.level} ${s.level.name}` : null,
    domains: Object.fromEntries(s.domains.map((d) => [d.id, d.pct])),
    layers: Object.fromEntries(s.layers.map((l) => [l.id, l.pct])),
  };
}

export async function listMyAssessments(uid: string): Promise<AssessmentDoc[]> {
  const { db } = getFirebase();
  const snap = await getDocs(query(collection(db, "assessments"), where("uid", "==", uid)));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<AssessmentDoc, "id">) }))
    .sort((a, b) => millis(b.createdAt) - millis(a.createdAt));
}

export async function getAssessment(id: string): Promise<AssessmentDoc | null> {
  const { db } = getFirebase();
  const snap = await getDoc(doc(db, "assessments", id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<AssessmentDoc, "id">) }) : null;
}

export async function createAssessment(uid: string, profile: LeadProfile): Promise<string> {
  const { db } = getFirebase();
  const ref = await addDoc(collection(db, "assessments"), {
    uid,
    status: "draft",
    responses: {},
    lead: {
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      institutionName: profile.institutionName,
      country: profile.country,
      institutionSize: profile.institutionSize,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function saveResponses(id: string, responses: Responses) {
  const { db } = getFirebase();
  await updateDoc(doc(db, "assessments", id), { responses, updatedAt: serverTimestamp() });
}

export async function completeAssessment(id: string, uid: string, responses: Responses) {
  const { db } = getFirebase();
  await updateDoc(doc(db, "assessments", id), {
    uid,
    responses,
    status: "completed",
    scores: summarise(responses),
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getProfile(uid: string): Promise<LeadProfile | null> {
  const { db } = getFirebase();
  const snap = await getDoc(doc(db, "leads", uid));
  return snap.exists() ? (snap.data() as LeadProfile) : null;
}
