// Stage-based recommendations per layer. Stage is picked from the layer's current maturity:
//   foundation  (avg < 2.5)  ->  integrate (2.5 - 3.49)  ->  intelligent (>= 3.5)
export interface LayerRecs {
  foundation: string;
  integrate: string;
  intelligent: string;
}

export const RECOMMENDATIONS: Record<string, LayerRecs> = {
  L01: {
    foundation: "Put the website, microsites and social channels under one content owner and set a simple digital marketing calendar with measurable lead targets.",
    integrate: "Connect the website, campaign tools and CRM so every enquiry is captured, source-attributed and followed up through automated email, SMS and WhatsApp journeys.",
    intelligent: "Roll out AI-driven personalisation and journey orchestration across channels, and report cost-per-enrolment and campaign ROI to the board.",
  },
  L02: {
    foundation: "Move enquiries, applications and document checks off spreadsheets and into one admissions workflow with defined turnaround times.",
    integrate: "Run enquiry-to-enrolment on one integrated platform with online fee payment, e-KYC and automated onboarding communication.",
    intelligent: "Introduce AI application screening, conversational onboarding assistants and funnel forecasting to raise yield and reduce melt.",
  },
  L03: {
    foundation: "Digitise programme, course and credit structures in a single academic master with version control and an approval trail.",
    integrate: "Link curriculum, CBCS credit rules and the academic calendar to the SIS and LMS so that changes flow downstream automatically.",
    intelligent: "Use outcome, employability and learner data to drive curriculum reviews and elective recommendations.",
  },
  L04: {
    foundation: "Capture sections, faculty workload and room allocation in a shared system rather than departmental sheets.",
    integrate: "Automate timetable generation, substitutions and attendance, integrated with the student information system.",
    intelligent: "Apply constraint-based optimisation and utilisation analytics to balance faculty load, rooms and labs.",
  },
  L05: {
    foundation: "Standardise on one LMS with minimum content, assignment and attendance practices for every course.",
    integrate: "Integrate the LMS, mentoring and lab management with student records, and track learner engagement centrally.",
    intelligent: "Roll out adaptive learning, AI early-warning for at-risk students and faculty copilots, with human oversight.",
  },
  L06: {
    foundation: "Digitise internal assessment records and the core examination logistics: scheduling, hall tickets and results.",
    integrate: "Run end-to-end digital examination workflows with audit trails, integrated results processing and revaluation tracking.",
    intelligent: "Adopt AI-assisted grading and feedback and AI-enabled invigilation, governed by clear policy and appeal routes.",
  },
  L07: {
    foundation: "Keep one authoritative student academic record with system-computed GPA/CGPA and transcripts.",
    integrate: "Automate progression, backlog, detention and condonation rules, and issue digital transcripts and certificates.",
    intelligent: "Issue verifiable digital credentials (for example via Academic Bank of Credits/DigiLocker) and use progression analytics to lift retention.",
  },
  L08: {
    foundation: "Replace paper registers for hostel, mess, transport and grievances with a basic digital service desk.",
    integrate: "Integrate access control, hostel, transport and health services with student identity and the SIS.",
    intelligent: "Apply IoT and predictive maintenance to campus services, and use service data to improve safety and wellbeing.",
  },
  L09: {
    foundation: "Record clubs, events and volunteering activity in one common platform.",
    integrate: "Integrate engagement records with the student profile and co-curricular transcript.",
    intelligent: "Use engagement analytics to personalise opportunities and link participation to student outcomes.",
  },
  L10: {
    foundation: "Define an approved channel set and templates for alerts, circulars and parent communication.",
    integrate: "Centralise notifications, helpdesk ticketing and feedback with service-level targets.",
    intelligent: "Deploy AI chatbots and sentiment analytics across channels and feed insights to leadership.",
  },
  L11: {
    foundation: "Move fee billing, collection and reconciliation onto a single system with online payments.",
    integrate: "Integrate fee, scholarship and refund workflows with the SIS, the finance ledger and government scholarship portals.",
    intelligent: "Use predictive dues and financial-aid analytics to improve collections and widen access.",
  },
  L12: {
    foundation: "Digitise degree audit and no-dues clearance so that eligibility is checked in one place.",
    integrate: "Automate eligibility checks and certificate issuance in the SIS, with convocation workflows.",
    intelligent: "Provide digitally verifiable degrees and a seamless hand-off into alumni records.",
  },
  L13: {
    foundation: "Build a clean alumni database and a placement and internship tracker.",
    integrate: "Integrate alumni, placement and employer CRM with student data and run structured engagement campaigns.",
    intelligent: "Use AI job matching, placement analytics and alumni-giving propensity models to grow outcomes and endowment.",
  },
  L14: {
    foundation: "Maintain a central register of projects, grants, publications and IP.",
    integrate: "Adopt a research management platform that covers funding, ethics and compliance workflows.",
    intelligent: "Use research analytics, citation tracking and generative-AI assistants to raise impact and commercialisation.",
  },
  L15: {
    foundation: "Run core finance, procurement and compliance on a single ERP, with a regulatory calendar (UGC/AICTE/NAAC/NIRF).",
    integrate: "Integrate budgeting, procurement, risk and accreditation data under approved governance, with an owner for each regulatory return.",
    intelligent: "Use predictive planning, continuous controls monitoring and executive dashboards for strategy and risk.",
  },
  L16: {
    foundation: "Centralise HR records, payroll and leave management in one HRMS.",
    integrate: "Integrate recruitment, performance and training with workforce planning.",
    intelligent: "Use workforce analytics and AI-assisted screening, with fairness checks and human decision-making.",
  },
  L17: {
    foundation: "Inventory systems and interfaces, and stop manual re-keying between your most important applications.",
    integrate: "Establish an API gateway or middleware plus workflow/BPM for cross-department processes and government portal links.",
    intelligent: "Deploy RPA, intelligent document processing and governed agentic orchestration across processes.",
  },
  L18: {
    foundation: "Agree a common data dictionary and publish a monthly KPI pack drawn from reliable sources.",
    integrate: "Implement a governed data platform with master data, data-quality rules and executive dashboards, including NIRF/NAAC/AISHE reporting.",
    intelligent: "Deploy predictive dropout and enrolment forecasting and agentic decision support on trusted data.",
  },
  L19: {
    foundation: "Publish an AI policy, assign accountability and inventory where AI is already in use.",
    integrate: "Stand up a governed AI platform with model documentation, bias audits and human-in-the-loop controls.",
    intelligent: "Scale agentic assistants for students, admissions and staff, with MLOps and continuous monitoring.",
  },
  L20: {
    foundation: "Enforce MFA, patching and tested backups, adopt a basic incident-response plan and name an accountable security owner.",
    integrate: "Establish SOC/SIEM monitoring and identity governance, and put DPDP Act compliance controls in place.",
    intelligent: "Adopt zero-trust, AI/LLM security, continuous testing and regular cyber-resilience drills.",
  },
  L21: {
    foundation: "Stabilise core infrastructure (network, backup, service desk) and retire duplicate applications.",
    integrate: "Consolidate ERP, CRM/SLCM, LMS and HRMS onto an integrated, cloud-ready architecture.",
    intelligent: "Move to cloud-native, observable platform operations with smart-campus services.",
  },
};

export function recommendationFor(layerId: string, avg: number): { stage: string; text: string } {
  const r = RECOMMENDATIONS[layerId];
  if (avg < 2.5) return { stage: "Build the foundation", text: r.foundation };
  if (avg < 3.5) return { stage: "Integrate and standardise", text: r.integrate };
  return { stage: "Add intelligence", text: r.intelligent };
}
