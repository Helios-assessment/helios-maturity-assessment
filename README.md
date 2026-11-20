# HELIOS™ Digital Maturity Assessment Tool

Interactive digital transformation maturity assessment for Higher Education Institutions, built on the **HELIOS Higher Education Capability Framework (21 layers, 54 dimensions, 241 capabilities)**.
Next.js (App Router, static export) · Tailwind CSS · Firebase Auth + Cloud Firestore · GitHub Pages.

## What it does

1. **Gated access.** Users register with Full Name, Work Email, Phone, Institution, Country and Institution Size, accept a privacy consent, and verify their email (Firebase Email/Password). The lead profile is stored in Firestore (`leads/{uid}`).
2. **Assessment.** 21 steps (one per layer), 54 questions (one per dimension), each scored L1–L5 or "Not applicable". Answers auto-save to Firestore (with a local backup) so progress is never lost. Users can run several assessments; each is a separate record.
3. **Scoring.** Live score per dimension → layer → domain → overall (0–100 composite), compared with a fixed **L4 Intelligent** target.
4. **Report.** Radar charts, bar chart, dimension heatmap, strengths, critical gaps, prioritised recommendations with time horizons, and an indicative NIRF/NAAC digital-readiness lens. Download via **Print / Save as PDF** or **Download HTML**.
5. **Admin.** `/admin` lists every lead and assessment and exports CSVs (restricted to admin emails).

## Scoring model

| Item | Rule |
|---|---|
| Dimension | 1–5 (L1 Fragmented, L2 Enabled, L3 Integrated, L4 Intelligent, L5 Autonomous); N/A is excluded |
| Layer | mean of its answered dimensions |
| Domain | weighted mean of its layers (default weights equal) |
| Overall | weighted mean of all 21 layers |
| Composite (0–100) | `(avg − 1) / 4 × 100` |
| Tier bands | L1 0–24 · L2 25–49 · L3 50–69 · L4 70–84 · L5 85–100 |
| Target | L4 for every layer (75/100) |

All of these live in `src/lib/config.ts`. Layer weights: `LAYER_WEIGHTS`. Domain grouping: `src/data/domains.ts`.

### Layer → domain grouping (please review)

The workbook defines 21 layers but no domains, so layers are grouped into the six HELIOS domains:

| Domain | Layers |
|---|---|
| D1 Digital Culture & Leadership | L15 Finance & Enterprise Operations, L16 HR & Workforce |
| D2 Learning & Learner Experience | L03, L04, L05, L06, L07, L08, L09, L10, L12 |
| D3 Research & Innovation | L14 Research & Innovation |
| D4 Data & Decision Systems | L18 Enterprise Data & Analytics, L19 AI & Agentic Systems |
| D5 Ecosystem & Partnerships | L01 Marketing & Stakeholder Engagement, L02 Admissions & Onboarding, L11 Financial & Scholarship, L13 Alumni & Career |
| D6 Digital Infrastructure | L17 Automation & Integration, L20 Cybersecurity, L21 Enterprise Technology Platform |

### Content you should review

- `src/data/rubric.ts`: level descriptors are templated per dimension. Add entries to `DIMENSION_OVERRIDES` for bespoke wording.
- `src/data/recommendations.ts`: stage-based recommendations for each layer (foundation → integrate → intelligent).
- `src/data/regulatory.ts`: layer-to-NIRF/NAAC mapping. NIRF weights follow the 2024/2025 University/Management frameworks (TLR 0.30, RPC 0.30, GO 0.20, OI 0.10, PR 0.10). NAAC moved in 2025 to Binary Accreditation with optional Maturity-Based Graded Levels (1–5). The report presents this as an **indicative digital-readiness lens, not a predicted rank or grade**.
- `src/data/framework.json` is generated from the workbook: `python3 scripts/generate-framework.py <workbook.xlsx>`.

## 1. Set up Firebase

1. Go to <https://console.firebase.google.com> → **Add project** (e.g. `helios-assessment`). Analytics is optional.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
   - *Settings → Authorized domains*: add your site domain (e.g. `assess.miraki23.com`) and `<owner>.github.io` if you test there. `localhost` is allowed by default.
   - *Templates → Email address verification*: customise the sender name and message if you wish.
3. **Build → Firestore Database → Create database** (production mode, choose a region close to your users, e.g. `asia-south1`).
4. **Project settings → General → Your apps → Web (`</>`)** → register an app. Copy the `firebaseConfig` values.
5. **Firestore rules.** Open `firestore.rules`, replace `admin@miraki23.com` with your administrator email(s) (lower-case), then paste the file into *Firestore → Rules → Publish* (or run `firebase deploy --only firestore:rules`).

The rules allow an authenticated user to create/read/update only their own `leads/{uid}` and `assessments/*` records; only verified emails can create or edit assessments; only listed admins can read everyone's data; nobody can delete.

## 2. Add GitHub secrets

*Repository → Settings → Secrets and variables → Actions → New repository secret*:

| Secret | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` |
| `NEXT_PUBLIC_ADMIN_EMAILS` | comma-separated admin emails, lower-case (must match `firestore.rules`) |

Firebase web config values are not confidential (they ship in every browser bundle); Firestore rules are what protect the data.

Optional *variable* (Settings → Secrets and variables → Actions → **Variables**): `NEXT_PUBLIC_BASE_PATH`. Leave unset for a custom domain; set to `/helios-maturity-assessment` if you serve from `https://<owner>.github.io/helios-maturity-assessment/`.

## 3. Deploy to GitHub Pages

1. *Settings → Pages → Build and deployment → Source: **GitHub Actions**.* (Pages for private repositories needs a paid GitHub plan.)
2. Push to `main`: `.github/workflows/deploy.yml` builds the static export and publishes it.
3. **Custom domain.** In *Settings → Pages → Custom domain* enter the host you chose (a sub-domain such as `assess.miraki23.com` is recommended, because `miraki23.com` itself hosts your main website). Create a DNS `CNAME` record from that host to `<owner>.github.io`, enable *Enforce HTTPS*, and add the host to Firebase *Authorized domains*.

## Local development

```bash
cp .env.example .env.local   # fill in Firebase values
npm install
npm run dev                  # http://localhost:3000
npm run build                # static site in ./out
```

## Data model

```
leads/{uid}        fullName, email, phone, institutionName, country, institutionSize,
                   consentAccepted, consentAt, createdAt, source
assessments/{id}   uid, status (draft|completed), responses {dimensionId: 0-5},
                   lead {…snapshot…}, scores {overallPct, levelName, domains, layers},
                   createdAt, updatedAt, completedAt
```

Export leads from `/admin` (CSV) or the Firebase console. Lead data is personal data: keep access limited to the admin list and honour deletion requests via the console.

## Notes and limits

- A static site has no server, so new-lead e-mail alerts are not built in. Add a Firebase Cloud Function or a HubSpot/Zapier integration if needed.
- Scores are self-assessed and indicative.
- The Print/Save-as-PDF route produces selectable-text, vector-quality PDFs in any modern browser.

HELIOS Framework™ © MIRAKI23 LLP. All rights reserved.
