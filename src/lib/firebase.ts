import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// NEXT_PUBLIC_* values are inlined at build time (from GitHub Secrets in CI).
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

export const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

/** Lazily initialises Firebase in the browser only (keeps the static prerender free of SDK calls). */
export function getFirebase() {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured. See README.md.");
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app: app!, auth: auth!, db: db! };
}
