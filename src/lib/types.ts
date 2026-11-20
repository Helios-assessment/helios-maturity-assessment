import type { Timestamp } from "firebase/firestore";
import type { Responses } from "./scoring";

export interface LeadProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  institutionName: string;
  country: string;
  institutionSize: string;
  consentAccepted: boolean;
  consentAt?: Timestamp | null;
  createdAt?: Timestamp | null;
  source: string;
}

export interface ScoreSummary {
  overallPct: number | null;
  overallAvg: number | null;
  levelName: string | null;
  domains: Record<string, number | null>;
  layers: Record<string, number | null>;
}

export interface AssessmentDoc {
  id: string;
  uid: string;
  status: "draft" | "completed";
  responses: Responses;
  lead: {
    fullName: string;
    email: string;
    phone: string;
    institutionName: string;
    country: string;
    institutionSize: string;
  };
  scores?: ScoreSummary;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  completedAt?: Timestamp | null;
}
