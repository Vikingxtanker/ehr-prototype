"use client";

import { format } from "date-fns";

import { GENDER_LABELS, STATUS_LABELS } from "@/lib/constants/patient";
import { getAge } from "@/lib/patients/format";
import { getPatientFullName, type Patient } from "@/lib/types/patient";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold tracking-wide text-[#888888] uppercase">
        {label}
      </p>

      <p className="truncate text-[13px] font-semibold text-[#444444]" title={value}>
        {value || "\u2014"}
      </p>
    </div>
  );
}

function getLengthOfStay(admittedAt: string | undefined): string {
  if (!admittedAt) return "\u2014";

  const days = Math.max(
    1,
    Math.floor((Date.now() - new Date(admittedAt).getTime()) / 86400000),
  );

  return `${days} day${days === 1 ? "" : "s"}`;
}

const ACTION_BUTTONS: Array<{ label: string; tab: string }> = [
  { label: "MAR", tab: "mar" },
  { label: "Diet Order", tab: "diet-chart" },
  { label: "Lab Orders", tab: "lab-reports" },
  { label: "Pharmacy", tab: "orders" },
  { label: "Radiology", tab: "radiology" },
];

export function PatientBanner({ patient }: { patient: Patient }) {
  const age = getAge(patient.dateOfBirth);

  const fields: Array<{ label: string; value: string }> = [
    { label: "UHID", value: patient.uhid },
    { label: "Patient Name", value: getPatientFullName(patient) },
    { label: "Age", value: age !== null ? `${age} Y` : "\u2014" },
    { label: "Gender", value: GENDER_LABELS[patient.gender] },
    {
      label: "DOB",
      value: format(new Date(patient.dateOfBirth), "dd-MM-yyyy"),
    },
    { label: "Mobile Number", value: patient.phone },
    { label: "Blood Group", value: patient.bloodGroup },
    {
      label: "Consultant",
      value: patient.admission?.consultantName ?? "\u2014",
    },
    {
      label: "Department",
      value: patient.admission ? "General Medicine" : "\u2014",
    },
    { label: "Nursing Unit", value: patient.admission?.ward ?? "\u2014" },
    { label: "Ward", value: patient.admission?.ward ?? "\u2014" },
    {
      label: "Bed Number",
      value: patient.admission ? `Bed ${patient.admission.bedNumber}` : "\u2014",
    },
    {
      label: "Admission Date",
      value: patient.admission
        ? format(new Date(patient.admission.admittedAt), "dd-MM-yyyy")
        : "\u2014",
    },
    {
      label: "Length of Stay",
      value: getLengthOfStay(patient.admission?.admittedAt),
    },
    { label: "Insurance", value: "Self Pay" },
    {
      label: "Primary Diagnosis",
      value: patient.admission?.diagnosis || patient.chiefComplaint || "\u2014",
    },
    {
      label: "Current Status",
      value: patient.admission?.status
        ? STATUS_LABELS[patient.admission.status]
        : "Registered",
    },
  ];

  return (
    <div className="rounded-[6px] border border-[#e4bcbc] bg-[#fff8f8] p-4">
      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-9">
        {fields.map((field) => (
          <Field key={field.label} label={field.label} value={field.value} />
        ))}
      </div>
    </div>
  );
}

export function PatientActionButtons({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {ACTION_BUTTONS.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => onNavigate(action.tab)}
          className="h-[30px] cursor-pointer rounded-full border border-[#4a90e2] bg-white px-3.5 text-[11px] font-semibold text-[#4a90e2] transition-colors hover:bg-[#4a90e2] hover:text-white"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
