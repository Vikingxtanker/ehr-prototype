import type { ProgressNoteStatus } from "./clinical-store";

export const DEPARTMENTS = [
  "General Medicine",
  "General Surgery",
  "Cardiology",
  "Neurology",
  "Orthopaedics",
  "Paediatrics",
  "Obstetrics & Gynaecology",
  "Intensive Care Unit",
  "Emergency Medicine",
  "Pulmonology",
  "Gastroenterology",
  "Nephrology",
  "Urology",
  "Dermatology",
] as const;

export const NOTE_STATUS_CONFIG: Record<
  ProgressNoteStatus,
  { label: string; className: string }
> = {
  Draft: {
    label: "Draft",
    className: "border-[#dddddd] bg-[#f5f5f5] text-[#555555]",
  },
  Finalized: {
    label: "Finalized",
    className: "border-[#c9b4a0] bg-[#fdf6ec] text-[#8a5a2b]",
  },
  Signed: {
    label: "Signed",
    className: "border-[#b7d7c0] bg-[#eef7f0] text-[#2e7d32]",
  },
};

export const STRUCTURED_HEADINGS = [
  "Diet:",
  "Plan of Care:",
  "Instructions:",
  "Multispecialty / Multidisciplinary Care Plan:",
  "Modification of Treatment Plan:",
  "Clinical Impression:",
  "Assessment:",
  "Plan:",
];

export function buildStructuredTemplate(): string {
  const body = STRUCTURED_HEADINGS.map(
    (heading) => `<h3><strong>${heading}</strong></h3><p><br></p>`,
  ).join("");

  return `<h3><strong>Diet:</strong></h3><p><br></p>${body}`;
}

export interface NoteTemplate {
  id: string;
  label: string;
  content: string;
}

function t(heading: string, lines: string[]): string {
  return `<h2><strong>${heading}</strong></h2>${lines
    .map((line) => `<p>${line}</p>`)
    .join("")}`;
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "soap",
    label: "SOAP",
    content: t("SOAP Note", [
      "<strong>Subjective:</strong> Patient reports...",
      "<strong>Objective:</strong> ...",
      "<strong>Assessment:</strong> ...",
      "<strong>Plan:</strong> ...",
    ]),
  },
  {
    id: "progress",
    label: "Progress Note",
    content: t("Progress Note", [
      "Patient Seen — Afebrile, stable, no fresh complaints.",
      "<strong>Vitals:</strong> BP 110/70 mmHg | Pulse 70/min | SpO₂ 98%",
      "Examination: ...",
      "Plan: ...",
    ]),
  },
  {
    id: "ward-round",
    label: "Ward Round",
    content: t("Ward Round", [
      "Ward round findings: ...",
      "System review: ...",
      "Investigations review: ...",
      "Medication review: ...",
      "Plan: ...",
    ]),
  },
  {
    id: "discharge-review",
    label: "Discharge Review",
    content: t("Discharge Review", [
      "Condition at review: Stable, vitals within normal limits.",
      "Discharge medications: ...",
      "Follow-up advised in ...",
      "Instructions: ...",
    ]),
  },
  {
    id: "post-op",
    label: "Post-operative Review",
    content: t("Post-operative Review", [
      "Post-operative day ...",
      "Surgical site: ...",
      "Drain / catheter status: ...",
      "Pain control: ...",
      "Plan: ...",
    ]),
  },
  {
    id: "icu-note",
    label: "ICU Note",
    content: t("ICU Note", [
      "<strong>Ventilation:</strong> ...",
      "<strong>Inotropes:</strong> ...",
      "<strong>Sedation:</strong> ...",
      "<strong>ABG / labs:</strong> ...",
      "<strong>Plan:</strong> ...",
    ]),
  },
];

export const FONT_FAMILIES = [
  "Arial",
  "Georgia",
  "Courier New",
  "Times New Roman",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Helvetica",
];

export const FONT_SIZES = [
  "11px",
  "12px",
  "13px",
  "14px",
  "15px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
];

export const TEXT_COLORS = [
  "#000000",
  "#333333",
  "#c62828",
  "#d9534f",
  "#e65100",
  "#2e7d32",
  "#1565c0",
  "#6a1b9a",
  "#777777",
];

export const HIGHLIGHT_COLORS = [
  "#fef08a",
  "#ffe4e6",
  "#d1fae5",
  "#bfdbfe",
  "#f3e8ff",
  "#fed7aa",
];

export function htmlToPlainText(html: string): string {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  const doc = new DOMParser().parseFromString(html, "text/html");

  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function formatNoteDateLabel(value: string): string {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
