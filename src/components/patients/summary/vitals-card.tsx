"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  addVitalReading,
  type AuditFields,
  type VitalReading,
} from "@/lib/patients/clinical-store";
import { formatIST, getCurrentUserName } from "@/lib/patients/audit";
import { useClinicalRecords } from "@/hooks/use-clinical-records";
import type { Patient } from "@/lib/types/patient";
import { cn } from "@/lib/utils";
import { AddDialog, FormField } from "./add-dialog";
import { AuditTooltip } from "./audit-tooltip";
import { SectionCard } from "./section-card";

type VitalStatus = "normal" | "warning" | "critical";

type VitalValues = Omit<VitalReading, "id" | keyof AuditFields>;

const STATUS_COLORS: Record<VitalStatus, string> = {
  normal: "text-[#2e7d32]",
  warning: "text-[#ef6c00]",
  critical: "text-[#c62828]",
};

interface VitalField {
  key: keyof VitalValues;
  label: string;
  placeholder: string;
  format: (value: string) => string;
}

const VITAL_FIELDS: VitalField[] = [
  { key: "height", label: "Height", placeholder: "170", format: (value) => `${value} cm` },
  { key: "weight", label: "Weight", placeholder: "68", format: (value) => `${value} kg` },
  { key: "bmi", label: "BMI", placeholder: "23.5", format: (value) => value },
  { key: "temperature", label: "Temperature", placeholder: "98.6", format: (value) => `${value} \u00b0F` },
  { key: "heartRate", label: "Heart Rate", placeholder: "78", format: (value) => `${value} bpm` },
  { key: "respiratoryRate", label: "Respiratory Rate", placeholder: "18", format: (value) => `${value} /min` },
  { key: "bloodPressure", label: "Blood Pressure", placeholder: "120/80", format: (value) => `${value} mmHg` },
  { key: "pulse", label: "Pulse", placeholder: "78", format: (value) => `${value} bpm` },
  { key: "spo2", label: "SpO\u2082", placeholder: "98", format: (value) => `${value} %` },
  { key: "bloodSugar", label: "Blood Sugar", placeholder: "110", format: (value) => `${value} mg/dL` },
  { key: "painScore", label: "Pain Score", placeholder: "0", format: (value) => `${value} /10` },
  { key: "gcs", label: "GCS", placeholder: "15", format: (value) => `${value} /15` },
];

const EMPTY_FORM: VitalValues = {
  height: "",
  weight: "",
  bmi: "",
  temperature: "",
  heartRate: "",
  respiratoryRate: "",
  bloodPressure: "",
  pulse: "",
  spo2: "",
  bloodSugar: "",
  painScore: "",
  gcs: "",
};

function getVitalStatus(label: string, value: string): VitalStatus {
  if (value.trim() === "") return "normal";

  const num = parseFloat(value);

  if (Number.isNaN(num)) return "normal";

  switch (label) {
    case "BMI":
      return num >= 18.5 && num <= 24.9 ? "normal" : "warning";
    case "Temperature":
      return num <= 99 ? "normal" : num <= 100.5 ? "warning" : "critical";
    case "Heart Rate":
    case "Pulse":
      return num >= 60 && num <= 100 ? "normal" : "warning";
    case "Respiratory Rate":
      return num >= 12 && num <= 20 ? "normal" : "warning";
    case "Blood Pressure": {
      const [sys, dia] = value.split("/").map((part) => parseFloat(part));

      if (Number.isNaN(sys) || Number.isNaN(dia)) return "normal";

      if (sys >= 180 || dia >= 120) return "critical";

      if (sys > 120 || dia > 80) return "warning";

      return "normal";
    }
    case "SpO\u2082":
      return num >= 95 ? "normal" : num >= 90 ? "warning" : "critical";
    case "Blood Sugar":
      return num >= 70 && num <= 140 ? "normal" : "warning";
    case "Pain Score":
      return num <= 3 ? "normal" : num <= 7 ? "warning" : "critical";
    case "GCS":
      return num >= 15 ? "normal" : num >= 13 ? "warning" : "critical";
    default:
      return "normal";
  }
}

export function VitalsCard({
  patient,
  className,
}: {
  patient: Patient;
  className?: string;
}) {
  const records = useClinicalRecords(patient.id);
  const latest = records.vitals[0];

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<VitalValues>(EMPTY_FORM);

  function setField(key: keyof VitalValues, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    addVitalReading(
      patient.id,
      {
        height: form.height.trim(),
        weight: form.weight.trim(),
        bmi: form.bmi.trim(),
        temperature: form.temperature.trim(),
        heartRate: form.heartRate.trim(),
        respiratoryRate: form.respiratoryRate.trim(),
        bloodPressure: form.bloodPressure.trim(),
        pulse: form.pulse.trim(),
        spo2: form.spo2.trim(),
        bloodSugar: form.bloodSugar.trim(),
        painScore: form.painScore.trim(),
        gcs: form.gcs.trim(),
      },
      getCurrentUserName(),
    );

    setForm(EMPTY_FORM);
    setOpen(false);
  }

  return (
    <SectionCard
      title="Latest Vitals"
      className={className}
      actions={
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex cursor-pointer items-center gap-0.5 text-[11px] font-semibold whitespace-nowrap text-[#4a90e2] hover:underline"
        >
          <Plus className="h-3 w-3" />

          Latest Vitals
        </button>
      }
    >
      {!latest ? (
        <p className="text-[12px] text-[#888888]">No vitals recorded.</p>
      ) : (
        <>
          <p className="mb-2 text-[10px] text-[#888888]">
            Recorded on {formatIST(latest.createdAt)} IST by{" "}
            <span className="font-semibold text-[#666666]">
              {latest.createdBy || "Unknown"}
            </span>
          </p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {VITAL_FIELDS.map((field) => {
              const raw = latest[field.key] ?? "";

              return (
                <div key={field.key} className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-wide text-[#888888] uppercase">
                    {field.label}
                  </p>

                  <AuditTooltip audit={latest}>
                    <p
                      className={cn(
                        "truncate cursor-default text-[13px] font-semibold",
                        raw === ""
                          ? "text-[#cccccc]"
                          : STATUS_COLORS[getVitalStatus(field.label, raw)],
                      )}
                    >
                      {raw === "" ? "\u2014" : field.format(raw)}
                    </p>
                  </AuditTooltip>
                </div>
              );
            })}
          </div>
        </>
      )}

      <AddDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Latest Vitals"
        onSave={handleSave}
        className="sm:max-w-lg"
      >
        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          {VITAL_FIELDS.map((field) => (
            <FormField key={field.key} label={field.label}>
              <Input
                value={form[field.key]}
                onChange={(event) => setField(field.key, event.target.value)}
                placeholder={field.placeholder}
              />
            </FormField>
          ))}
        </div>
      </AddDialog>
    </SectionCard>
  );
}
