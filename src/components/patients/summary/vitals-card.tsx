"use client";

import { useState, type ReactNode } from "react";

import { Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  addVitalReading,
  type FieldAudit,
  type VitalFieldKey,
  type VitalReading,
  type VitalValues,
} from "@/lib/patients/clinical-store";
import { formatIST, getCurrentUserName } from "@/lib/patients/audit";
import { useClinicalRecords } from "@/hooks/use-clinical-records";
import type { Patient } from "@/lib/types/patient";
import {
  computeBMI,
  computeTotalGCS,
  getVitalStatus,
  GCS_EYE_OPTIONS,
  GCS_MOTOR_OPTIONS,
  GCS_VERBAL_OPTIONS,
  mewsScore,
  STATUS_COLORS,
  toNumber,
} from "@/lib/patients/vitals";
import { cn } from "@/lib/utils";
import { AddDialog, FormField } from "./add-dialog";
import { SectionCard } from "./section-card";

interface DisplayField {
  key: string;
  label: string;
  format: (value: string) => string;
  resolve: (readings: VitalReading[]) => FieldSource | null;
}

const DISPLAY_FIELDS: DisplayField[] = [
  { key: "height", label: "Height", format: (value) => `${value} cm`, resolve: (readings) => resolveField(readings, "height") },
  { key: "weight", label: "Weight", format: (value) => `${value} kg`, resolve: (readings) => resolveField(readings, "weight") },
  { key: "bmi", label: "BMI", format: (value) => value, resolve: (readings) => resolveField(readings, "bmi") },
  { key: "temperature", label: "Temperature", format: (value) => `${value} \u00b0F`, resolve: (readings) => resolveField(readings, "temperature") },
  { key: "heartRate", label: "Heart Rate", format: (value) => `${value} bpm`, resolve: (readings) => resolveField(readings, "heartRate") },
  { key: "respiratoryRate", label: "Respiratory Rate", format: (value) => `${value} /min`, resolve: (readings) => resolveField(readings, "respiratoryRate") },
  { key: "bloodPressure", label: "Blood Pressure", format: (value) => value, resolve: resolveBP },
  { key: "spo2", label: "SpO\u2082", format: (value) => `${value} %`, resolve: (readings) => resolveField(readings, "spo2") },
  { key: "bloodSugar", label: "Blood Sugar", format: (value) => `${value} mg/dL`, resolve: (readings) => resolveField(readings, "bloodSugar") },
  { key: "painScore", label: "Pain Score", format: (value) => `${value} /10`, resolve: (readings) => resolveField(readings, "painScore") },
  { key: "gcs", label: "GCS", format: (value) => `${value} /15`, resolve: (readings) => resolveField(readings, "gcs") },
  { key: "avpu", label: "AVPU", format: (value) => value, resolve: (readings) => resolveField(readings, "avpu") },
  { key: "urineOutput", label: "Urine Output", format: (value) => `${value} mL`, resolve: (readings) => resolveField(readings, "urineOutput") },
];

interface FormFieldConfig {
  key: VitalFieldKey;
  label: string;
  placeholder: string;
}

const FORM_FIELDS: FormFieldConfig[] = [
  { key: "height", label: "Height", placeholder: "170" },
  { key: "weight", label: "Weight", placeholder: "68" },
  { key: "bmi", label: "BMI", placeholder: "23.5" },
  { key: "temperature", label: "Temperature", placeholder: "98.6" },
  { key: "heartRate", label: "Heart Rate", placeholder: "78" },
  { key: "respiratoryRate", label: "Respiratory Rate", placeholder: "18" },
  { key: "systolicBP", label: "Systolic BP", placeholder: "120" },
  { key: "diastolicBP", label: "Diastolic BP", placeholder: "80" },
  { key: "spo2", label: "SpO\u2082", placeholder: "98" },
  { key: "bloodSugar", label: "Blood Sugar", placeholder: "110" },
  { key: "painScore", label: "Pain Score", placeholder: "0" },
  { key: "avpu", label: "AVPU", placeholder: "Alert" },
  { key: "urineOutput", label: "Urine Output", placeholder: "300" },
];

const EMPTY_FORM: VitalValues = {
  height: "",
  weight: "",
  bmi: "",
  temperature: "",
  heartRate: "",
  respiratoryRate: "",
  systolicBP: "",
  diastolicBP: "",
  spo2: "",
  bloodSugar: "",
  painScore: "",
  gcs: "",
  gcsEye: "",
  gcsVerbal: "",
  gcsMotor: "",
  avpu: "",
  urineOutput: "",
  remarks: "",
};

const VITAL_VALUE_KEYS = Object.keys(EMPTY_FORM) as VitalFieldKey[];

const GCS_COMPONENTS = [
  {
    key: "gcsEye" as const,
    label: "Eye Response",
    options: GCS_EYE_OPTIONS,
  },
  {
    key: "gcsVerbal" as const,
    label: "Verbal Response",
    options: GCS_VERBAL_OPTIONS,
  },
  {
    key: "gcsMotor" as const,
    label: "Motor Response",
    options: GCS_MOTOR_OPTIONS,
  },
];

type RiskTone = "green" | "yellow" | "red" | "none";

const TONES: Record<RiskTone, string> = {
  green: "bg-[#e8f5e9] text-[#2e7d32]",
  yellow: "bg-[#fff3e0] text-[#ef6c00]",
  red: "bg-[#fdecea] text-[#c62828]",
  none: "bg-[#f5f5f5] text-[#999999]",
};

interface SnapshotItem {
  label: string;
  value: string;
  tone: RiskTone;
}

function newsScore(reading: VitalReading | undefined): number | null {
  if (!reading) return null;

  const hr = toNumber(reading.heartRate);
  const rr = toNumber(reading.respiratoryRate);
  const fahrenheit = toNumber(reading.temperature);
  const spo2 = toNumber(reading.spo2);
  const gcs = toNumber(reading.gcs);
  const sys = toNumber(reading.systolicBP);

  if ([hr, rr, fahrenheit, sys].some((value) => value === null)) return null;

  let score = 0;

  if (hr !== null) score += hr <= 40 ? 3 : hr <= 50 ? 1 : hr <= 90 ? 0 : hr <= 110 ? 1 : hr <= 130 ? 2 : 3;
  if (rr !== null) score += rr <= 8 ? 3 : rr <= 11 ? 1 : rr <= 20 ? 0 : rr <= 24 ? 2 : 3;
  if (spo2 !== null) score += spo2 <= 91 ? 3 : spo2 <= 93 ? 2 : spo2 <= 95 ? 1 : 0;
  if (fahrenheit !== null) {
    const celsius = ((fahrenheit - 32) * 5) / 9;
    score += celsius <= 35 ? 3 : celsius <= 36 ? 1 : celsius <= 38 ? 0 : celsius <= 39 ? 1 : 2;
  }
  if (sys !== null) score += sys <= 90 ? 3 : sys <= 100 ? 2 : sys <= 110 ? 1 : sys <= 219 ? 0 : 3;
  if (gcs !== null) score += gcs < 15 ? 3 : 0;

  return score;
}

function toneFromScore(score: number | null): RiskTone {
  if (score === null) return "none";

  if (score >= 5) return "red";

  if (score >= 2) return "yellow";

  return "green";
}

interface FieldSource {
  reading: VitalReading;
  value: string;
  audit?: FieldAudit;
}

function resolveField(
  readings: VitalReading[],
  key: VitalFieldKey,
): FieldSource | null {
  for (const reading of readings) {
    const value = (reading[key] ?? "").trim();

    if (value !== "") {
      return {
        reading,
        value,
        audit: reading.fieldAudit?.[key],
      };
    }
  }

  return null;
}

function resolveBP(readings: VitalReading[]): FieldSource | null {
  for (const reading of readings) {
    const sys = (reading.systolicBP ?? "").trim();
    const dia = (reading.diastolicBP ?? "").trim();

    if (sys !== "" || dia !== "") {
      return {
        reading,
        value: sys && dia ? `${sys}/${dia}` : sys || dia,
        audit:
          reading.fieldAudit?.systolicBP ?? reading.fieldAudit?.diastolicBP,
      };
    }
  }

  return null;
}

function buildMergedReading(readings: VitalReading[]): VitalReading {
  const merged: Partial<VitalReading> = {};

  for (const reading of readings) {
    for (const key of VITAL_VALUE_KEYS) {
      const value = (reading[key] ?? "").trim();

      if (value !== "" && !merged[key]) {
        merged[key] = value;
      }
    }
  }

  return merged as VitalReading;
}

function VitalValueTooltip({
  label,
  name,
  time,
  isEarlier,
  children,
}: {
  label: string;
  name: string;
  time: string;
  isEarlier: boolean;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>

      <TooltipContent
        side="top"
        align="center"
        className="max-w-xs flex-col items-start gap-1"
      >
        <span className="text-[11px] font-semibold text-white">{label}</span>

        <span className="text-[11px] text-white/80">
          Entered by {name} on {time} IST
        </span>

        {isEarlier && (
          <span className="text-[11px] text-amber-300">
            From an earlier recording
          </span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function VitalsCard({
  patient,
  className,
}: {
  patient: Patient;
  className?: string;
}) {
  const records = useClinicalRecords(patient.id);
  const vitals = records.vitals;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<VitalValues>(EMPTY_FORM);

  function setField(key: keyof VitalValues, value: string) {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === "height" || key === "weight") {
        next.bmi = computeBMI(next.height, next.weight);
      }

      if (key === "gcsEye" || key === "gcsVerbal" || key === "gcsMotor") {
        next.gcs = computeTotalGCS(next.gcsEye, next.gcsVerbal, next.gcsMotor);
      }

      return next;
    });
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
        systolicBP: form.systolicBP.trim(),
        diastolicBP: form.diastolicBP.trim(),
        spo2: form.spo2.trim(),
        bloodSugar: form.bloodSugar.trim(),
        painScore: form.painScore.trim(),
        gcs: form.gcs.trim(),
        gcsEye: form.gcsEye.trim(),
        gcsVerbal: form.gcsVerbal.trim(),
        gcsMotor: form.gcsMotor.trim(),
        avpu: form.avpu.trim(),
        urineOutput: form.urineOutput.trim(),
        remarks: form.remarks.trim(),
      },
      getCurrentUserName(),
    );

    setForm(EMPTY_FORM);
    setOpen(false);
  }

  const merged = buildMergedReading(vitals);
  const mews = mewsScore(merged);
  const news = newsScore(merged);
  const bmi = toNumber(merged.bmi);

  const scoreItems: SnapshotItem[] = [
    {
      label: "BMI Indicator",
      value:
        bmi === null
          ? "\u2014"
          : `${bmi} \u00b7 ${
              bmi >= 18.5 && bmi <= 24.9 ? "Normal" : "Abnormal"
            }`,
      tone:
        bmi === null
          ? "none"
          : bmi >= 18.5 && bmi <= 24.9
            ? "green"
            : "yellow",
    },
    {
      label: "MEWS Score",
      value: mews === null ? "\u2014" : String(mews),
      tone: toneFromScore(mews),
    },
    {
      label: "NEWS Score",
      value: news === null ? "\u2014" : String(news),
      tone: toneFromScore(news),
    },
    {
      label: "Risk Level",
      value:
        mews === null ? "\u2014" : mews >= 5 ? "High" : mews >= 2 ? "Medium" : "Low",
      tone: toneFromScore(mews),
    },
    { label: "Isolation Status", value: "\u2014", tone: "none" },
    { label: "Code Status", value: "\u2014", tone: "none" },
    { label: "Fall Risk", value: "\u2014", tone: "none" },
    { label: "Pressure Ulcer Risk", value: "\u2014", tone: "none" },
  ];

  return (
    <SectionCard
      title="Latest Vitals"
      className={className}
      bodyClassName="overflow-y-auto"
      actions={
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex cursor-pointer items-center gap-0.5 text-[11px] font-semibold whitespace-nowrap text-[#4a90e2] hover:underline"
        >
          <Plus className="h-3 w-3" />

          Add Vitals
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {scoreItems.map((item) => (
          <div
            key={item.label}
            className="rounded-[4px] border border-[#eeeeee] bg-[#fcfcfc] px-2 py-1.5"
          >
            <p className="text-[10px] font-semibold tracking-wide text-[#888888] uppercase">
              {item.label}
            </p>

            <span
              className={cn(
                "mt-0.5 inline-flex rounded px-1.5 py-0.5 text-[11px] font-semibold",
                TONES[item.tone],
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {vitals.length === 0 ? (
        <p className="mt-3 text-[10px] text-[#888888]">
          Add latest vitals to calculate MEWS / NEWS scores.
        </p>
      ) : (
        <>
          <p className="mt-3 mb-2 text-[10px] text-[#888888]">
            Latest update: {formatIST(vitals[0].createdAt)} IST
          </p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {DISPLAY_FIELDS.map((field) => {
              const source = field.resolve(vitals);
              const raw = source?.value ?? "";
              const name =
                source?.audit?.by ?? source?.reading.createdBy ?? "Unknown";
              const time = formatIST(
                source?.audit?.at ?? source?.reading.createdAt ?? "",
              );
              const isEarlier =
                source !== null && source.reading.id !== vitals[0].id;

              return (
                <div key={field.key} className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-wide text-[#888888] uppercase">
                    {field.label}
                  </p>

                  {source ? (
                    <VitalValueTooltip
                      label={field.label}
                      name={name}
                      time={time}
                      isEarlier={isEarlier}
                    >
                      <p
                        className={cn(
                          "truncate cursor-default text-[13px] font-semibold",
                          STATUS_COLORS[getVitalStatus(field.label, raw)],
                        )}
                      >
                        {field.format(raw)}
                      </p>
                    </VitalValueTooltip>
                  ) : (
                    <p className="truncate text-[13px] font-semibold text-[#cccccc]">
                      {"\u2014"}
                    </p>
                  )}
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
          {FORM_FIELDS.map((field) => (
            <FormField key={field.key} label={field.label}>
              <Input
                value={form[field.key]}
                onChange={(event) => setField(field.key, event.target.value)}
                placeholder={field.placeholder}
                disabled={field.key === "bmi"}
              />
            </FormField>
          ))}

          <div className="col-span-2">
            <p className="mb-1 text-[10px] font-semibold tracking-wide text-[#888888] uppercase">
              Glasgow Coma Scale
            </p>

            <div className="grid grid-cols-3 gap-x-2">
              {GCS_COMPONENTS.map((component) => (
                <FormField key={component.key} label={component.label}>
                  <select
                    value={form[component.key]}
                    onChange={(event) =>
                      setField(component.key, event.target.value)
                    }
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {component.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              ))}
            </div>

            <div className="mt-1.5 flex items-center justify-between rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-1.5">
              <span className="text-[12px] font-semibold text-[#333333]">
                Total GCS: {form.gcs ? `${form.gcs} / 15` : "\u2014"}
              </span>

              <span className="text-[10px] text-[#888888]">
                Eye + Verbal + Motor
              </span>
            </div>
          </div>
        </div>
      </AddDialog>
    </SectionCard>
  );
}
