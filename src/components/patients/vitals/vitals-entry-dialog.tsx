"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  addVitalReading,
  type VitalFieldKey,
  type VitalReading,
  type VitalValues,
} from "@/lib/patients/clinical-store";
import { getCurrentUserName } from "@/lib/patients/audit";
import {
  computeBMI,
  computeTotalGCS,
  GCS_EYE_OPTIONS,
  GCS_MOTOR_OPTIONS,
  GCS_VERBAL_OPTIONS,
  type SelectOption,
} from "@/lib/patients/vitals";
import { cn } from "@/lib/utils";
import { AddDialog, FormField } from "../summary/add-dialog";

type FormValues = VitalValues;

const EMPTY_FORM: FormValues = {
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

const AVPU_OPTIONS: SelectOption[] = [
  { value: "", label: "Select AVPU" },
  { value: "Alert", label: "Alert" },
  { value: "Voice", label: "Voice" },
  { value: "Pain", label: "Pain" },
  { value: "Unresponsive", label: "Unresponsive" },
];

interface FieldDef {
  key: VitalFieldKey;
  label: string;
  placeholder?: string;
  options?: SelectOption[];
  disabled?: boolean;
}

const FIELDS: FieldDef[] = [
  { key: "temperature", label: "Temperature (°F)", placeholder: "98.6" },
  { key: "heartRate", label: "Heart Rate (bpm)", placeholder: "78" },
  { key: "systolicBP", label: "Systolic BP (mmHg)", placeholder: "120" },
  { key: "diastolicBP", label: "Diastolic BP (mmHg)", placeholder: "80" },
  { key: "respiratoryRate", label: "Respiratory Rate (/min)", placeholder: "18" },
  { key: "spo2", label: "SpO₂ (%)", placeholder: "98" },
  { key: "height", label: "Height (cm)", placeholder: "170" },
  { key: "weight", label: "Weight (kg)", placeholder: "68" },
  { key: "bmi", label: "BMI", placeholder: "Auto-calculated", disabled: true },
  { key: "bloodSugar", label: "Blood Sugar (mg/dL)", placeholder: "110" },
  { key: "painScore", label: "Pain Score", placeholder: "0" },
  { key: "gcsEye", label: "Eye Response", options: GCS_EYE_OPTIONS },
  { key: "gcsVerbal", label: "Verbal Response", options: GCS_VERBAL_OPTIONS },
  { key: "gcsMotor", label: "Motor Response", options: GCS_MOTOR_OPTIONS },
  { key: "avpu", label: "AVPU", options: AVPU_OPTIONS },
  { key: "urineOutput", label: "Urine Output (mL)", placeholder: "300" },
];

function copyFromReading(reading: VitalReading | undefined): FormValues {
  if (!reading) return EMPTY_FORM;

  return {
    height: reading.height ?? "",
    weight: reading.weight ?? "",
    bmi: reading.bmi ?? "",
    temperature: reading.temperature ?? "",
    heartRate: reading.heartRate ?? "",
    respiratoryRate: reading.respiratoryRate ?? "",
    systolicBP: reading.systolicBP ?? "",
    diastolicBP: reading.diastolicBP ?? "",
    spo2: reading.spo2 ?? "",
    bloodSugar: reading.bloodSugar ?? "",
    painScore: reading.painScore ?? "",
    gcs: reading.gcs ?? "",
    gcsEye: reading.gcsEye ?? "",
    gcsVerbal: reading.gcsVerbal ?? "",
    gcsMotor: reading.gcsMotor ?? "",
    avpu: reading.avpu ?? "",
    urineOutput: reading.urineOutput ?? "",
    remarks: reading.remarks ?? "",
  };
}

function prefillFocus(
  source: VitalReading | undefined,
  keys: VitalFieldKey[],
): FormValues {
  const form = { ...EMPTY_FORM };

  if (source) {
    for (const key of keys) {
      form[key] = (source[key] ?? "").trim();
    }
  }

  return form;
}

export function VitalsEntryDialog({
  open,
  onOpenChange,
  onSaved,
  patientId,
  initial,
  focusKeys,
  focusLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (id: string) => void;
  patientId: string;
  initial?: VitalReading;
  focusKeys?: VitalFieldKey[];
  focusLabel?: string;
}) {
  const [form, setForm] = useState<FormValues>(() =>
    focusKeys
      ? prefillFocus(initial, focusKeys)
      : copyFromReading(initial),
  );

  function setField(key: keyof FormValues, value: string) {
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
    const values: FormValues = {
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
    };

    const actor = getCurrentUserName();

    const id = addVitalReading(patientId, values, actor, initial);

    setForm(EMPTY_FORM);
    onOpenChange(false);
    onSaved?.(id);
  }

  const visibleFields = focusKeys
    ? FIELDS.filter((field) => focusKeys.includes(field.key))
    : FIELDS;

  const showGcsTotal = visibleFields.some((field) =>
    field.key.startsWith("gcs"),
  );

  const title = focusKeys
    ? initial
      ? `Update ${focusLabel ?? "Vitals"}`
      : `Add ${focusLabel ?? "Vitals"}`
    : initial
      ? "Update Vitals"
      : "Latest Vitals";

  const description = focusKeys
    ? initial
      ? "Update this vital sign as a new observation entry. Previous recordings are kept for comparison."
      : "Record this vital sign as a new observation entry. Previous recordings are kept for comparison."
    : initial
      ? "This saves as a new observation entry — previous recordings are kept for comparison."
      : "Record a new set of vital signs for this patient.";

  return (
    <AddDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      onSave={handleSave}
      saveLabel={focusKeys ? (initial ? "Update" : "Save") : "Save Vitals"}
      className="sm:max-w-xl"
    >
      <div
        className={cn(
          "grid gap-x-3 gap-y-3",
          visibleFields.length === 1 ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        {visibleFields.map((field) => (
          <FormField key={field.key} label={field.label}>
            {field.options ? (
              <select
                value={form[field.key]}
                onChange={(event) => setField(field.key, event.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={form[field.key]}
                onChange={(event) => setField(field.key, event.target.value)}
                placeholder={field.placeholder}
                disabled={field.disabled}
              />
            )}
          </FormField>
        ))}

        {showGcsTotal && (
          <div className={cn(visibleFields.length === 1 ? "" : "col-span-2")}>
            <p className="text-[10px] font-semibold tracking-wide text-[#888888] uppercase">
              Total GCS
            </p>

            <div className="mt-1 flex items-center justify-between rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2">
              <span className="text-[13px] font-semibold text-[#333333]">
                {form.gcs ? `${form.gcs} / 15` : "\u2014"}
              </span>

              <span className="text-[10px] text-[#888888]">
                Eye + Verbal + Motor
              </span>
            </div>
          </div>
        )}

        <div className={cn(visibleFields.length === 1 ? "" : "col-span-2")}>
          <FormField label="Remarks">
            <Textarea
              value={form.remarks}
              onChange={(event) => setField("remarks", event.target.value)}
              placeholder="Additional notes for this recording"
              className="min-h-[64px]"
            />
          </FormField>
        </div>
      </div>
    </AddDialog>
  );
}
