"use client";

import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  Activity,
  ArrowLeftRight,
  ArrowUpDown,
  ClipboardCheck,
  ClipboardList,
  FileCheck,
  FlaskConical,
  FolderOpen,
  LayoutGrid,
  NotebookPen,
  NotebookText,
  Pill,
  Scan,
  ShieldAlert,
  ShoppingCart,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface PatientTab {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const PATIENT_TABS: PatientTab[] = [
  {
    id: "summary",
    label: "Summary",
    icon: LayoutGrid,
    description:
      "Overview of the patient's demographic, contact, medical history and admission details.",
  },
  {
    id: "vitals",
    label: "Vitals",
    icon: Activity,
    description:
      "Temperature, pulse, respiration, blood pressure, SpO₂ and weight recorded at each shift.",
  },
  {
    id: "assessment",
    label: "Assessment (Daily)",
    icon: ClipboardCheck,
    description:
      "Daily nursing assessment covering the patient's condition, mobility, skin and hygiene needs.",
  },
  {
    id: "io-chart",
    label: "I/O Chart",
    icon: ArrowUpDown,
    description:
      "Input and output tracking — oral fluids, IV, urine, drains and stools charted per shift.",
  },
  {
    id: "lab-reports",
    label: "Laboratory Reports",
    icon: FlaskConical,
    description:
      "Lab investigations — CBC, biochemistry, microbiology and pathology reports.",
  },
  {
    id: "radiology",
    label: "Radiology",
    icon: Scan,
    description:
      "X-ray, ultrasound, CT and MRI images with the radiologist's report.",
  },
  {
    id: "mar",
    label: "MAR",
    icon: Pill,
    description:
      "Medication Administration Record — medicines scheduled, administered and tracked against the doctor's orders.",
  },
  {
    id: "nursing-notes",
    label: "Nursing notes",
    icon: NotebookPen,
    description:
      "Progress notes documented by the nursing staff at each shift.",
  },
  {
    id: "doctors-notes",
    label: "Doctors notes",
    icon: NotebookText,
    description:
      "Daily progress notes and observations recorded by the treating doctor.",
  },
  {
    id: "clinical-forms",
    label: "Clinical forms",
    icon: ClipboardList,
    description:
      "Choose and attach clinical forms to this patient's record.",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
    description:
      "Medicine orders linked when added in the MAR or a prescription.",
  },
  {
    id: "diet-chart",
    label: "Diet chart",
    icon: UtensilsCrossed,
    description:
      "Prescribed diet plan and nutritional assessment prepared by the dietitian.",
  },
  {
    id: "physiotherapy",
    label: "Physiotherapy assessment",
    icon: Accessibility,
    description:
      "Physiotherapy evaluation and treatment plan for applicable patients.",
  },
  {
    id: "documents",
    label: "Documents",
    icon: FolderOpen,
    description:
      "Aadhaar card, consent forms and other official documents required during admission.",
  },
  {
    id: "diagnosis",
    label: "Diagnosis",
    icon: Stethoscope,
    description:
      "Edit the full list of diagnoses with ICD codes for this patient.",
  },
  {
    id: "referral",
    label: "Referral",
    icon: ArrowLeftRight,
    description:
      "Doctor referrals to and from other consultants.",
  },
  {
    id: "allergy-history",
    label: "Allergy / History",
    icon: ShieldAlert,
    description:
      "Allergies, past medical history and past medication history.",
  },
  {
    id: "discharge-summary",
    label: "Discharge summary",
    icon: FileCheck,
    description:
      "Formatted discharge summary assembled from the patient's details.",
  },
];

export function PatientTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PATIENT_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-selected={isActive}
            role="tab"
            className={cn(
              "flex h-[34px] shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium whitespace-nowrap transition-colors",
              isActive
                ? "border-[#d9534f] bg-[#d9534f] text-white shadow-sm"
                : "border-[#dddddd] bg-[#f5f5f5] text-[#555555] hover:bg-white hover:text-[#333333]",
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                isActive ? "text-white" : "text-[#888888]",
              )}
            />

            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function PatientModulePlaceholder({ tab }: { tab: PatientTab }) {
  const Icon = tab.icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-[6px] border border-[#e5c5c5] bg-white px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f7f7] ring-1 ring-inset ring-[#eeeeee]">
        <Icon className="h-6 w-6 text-[#888888]" />
      </div>

      <h2 className="mt-4 text-[15px] font-semibold text-[#333333]">
        {tab.label}
      </h2>

      <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-[#777777]">
        {tab.description}
      </p>

      <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#dddddd] bg-[#f5f5f5] px-3 py-1 text-[10px] font-semibold tracking-wide text-[#777777] uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-[#d9534f]" />

        Module under development
      </span>
    </div>
  );
}
