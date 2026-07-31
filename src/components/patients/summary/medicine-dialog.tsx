"use client";

import { useMemo, useState } from "react";

import { format } from "date-fns";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { GENDER_LABELS } from "@/lib/constants/patient";
import {
  addMedication,
  updateMedication,
  type AuditFields,
  type Medication,
  type MedStatus,
  type Priority,
} from "@/lib/patients/clinical-store";
import {
  getCurrentUserName,
  nowISTDateTimeInputValue,
} from "@/lib/patients/audit";
import {
  addDurationToDatetimeLocal,
  computeQuantity,
  DOCTORS,
  DOSE_UNITS,
  DURATION_UNITS,
  findMedicineByLabel,
  FREQUENCY_OPTIONS,
  INSTRUCTIONS,
  MEDICINE_CATALOG,
  MEDICINE_FORMS,
  medicineLabel,
  ROUTE_OPTIONS,
  SCHEDULE_OPTIONS,
  type DurationUnit,
  type MedicineItem,
} from "@/lib/patients/medicine-data";
import { getAge } from "@/lib/patients/format";
import { getPatientFullName, type Patient } from "@/lib/types/patient";
import { cn } from "@/lib/utils";

const PRIORITIES: Priority[] = ["Routine", "STAT", "Urgent", "PRN"];

type BooleanFormKey =
  | "statDose"
  | "sos"
  | "patientOwnMed"
  | "taperDose";

const CLINICAL_OPTIONS: Array<{
  key: BooleanFormKey;
  label: string;
}> = [
  { key: "statDose", label: "STAT Dose Now" },
  { key: "sos", label: "SOS (PRN)" },
  { key: "patientOwnMed", label: "Brought from Home" },
  { key: "taperDose", label: "Taper Dose" },
];

interface MedicineFormState {
  medicineSearch: string;
  form: string;
  strength: string;
  priority: Priority;
  dose: string;
  unit: string;
  frequencyType: "Daily" | "Weekly";
  frequency: string;
  schedule: string[];
  route: string;
  duration: string;
  durationUnit: DurationUnit;
  instructions: string;
  remarks: string;
  startDate: string;
  endDate: string;
  statDose: boolean;
  sos: boolean;
  patientOwnMed: boolean;
  taperDose: boolean;
  practitioner: string;
}

function createEmptyForm(): MedicineFormState {
  return {
    medicineSearch: "",
    form: "",
    strength: "",
    priority: "Routine",
    dose: "",
    unit: "",
    frequencyType: "Daily",
    frequency: "",
    schedule: [],
    route: "",
    duration: "",
    durationUnit: "Days",
    instructions: "",
    remarks: "",
    startDate: nowISTDateTimeInputValue(),
    endDate: "",
    statDose: false,
    sos: false,
    patientOwnMed: false,
    taperDose: false,
    practitioner: getCurrentUserName(),
  };
}

function fromMedication(medication: Medication): MedicineFormState {
  return {
    medicineSearch: medication.drug,
    form: medication.form ?? "",
    strength: medication.strength ?? "",
    priority: medication.priority,
    dose: medication.dose,
    unit: medication.unit ?? "",
    frequencyType: medication.frequencyType ?? "Daily",
    frequency: medication.frequency,
    schedule: medication.schedule
      ? medication.schedule
          .split(", ")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    route: medication.route,
    duration: medication.duration,
    durationUnit: medication.durationUnit ?? "Days",
    instructions: medication.instructions ?? "",
    remarks: medication.remarks ?? "",
    startDate: medication.startDate,
    endDate: medication.endDate ?? "",
    statDose: medication.statDose ?? false,
    sos: medication.sos ?? false,
    patientOwnMed: medication.patientOwnMed ?? false,
    taperDose: medication.taperDose ?? false,
    practitioner: medication.prescribedBy,
  };
}

function autoEndDate(current: MedicineFormState): string {
  const duration = parseFloat(current.duration);

  if (
    current.startDate &&
    !Number.isNaN(duration) &&
    duration > 0
  ) {
    return addDurationToDatetimeLocal(
      current.startDate,
      duration,
      current.durationUnit,
    );
  }

  return current.endDate;
}

function getHospitalDay(admittedAt: string): string {
  const days = Math.max(
    1,
    Math.floor((Date.now() - new Date(admittedAt).getTime()) / 86400000) + 1,
  );

  return `Day ${days}`;
}

function BannerField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium tracking-wide text-[#8a6d6d] uppercase">
        {label}
      </p>

      <p className="truncate text-[15px] font-semibold text-[#333333]" title={value}>
        {value || "\u2014"}
      </p>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <label className="block text-[11px] font-medium text-[#777777]">
        {label}{" "}
        {required && <span className="text-[#d9534f]">*</span>}
      </label>

      {children}

      {error && <p className="text-[10px] font-medium text-[#c62828]">{error}</p>}
    </div>
  );
}

export function MedicineDialog({
  patient,
  open,
  onOpenChange,
  editing,
}: {
  patient: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Medication | null;
}) {
  const [form, setForm] = useState<MedicineFormState>(() =>
    editing ? fromMedication(editing) : createEmptyForm(),
  );
  const [errors, setErrors] = useState<Partial<Record<keyof MedicineFormState, string>>>({});

  const medicineMatches = useMemo(() => {
    const query = form.medicineSearch.trim().toLowerCase();

    if (!query) return MEDICINE_CATALOG.slice(0, 12);

    return MEDICINE_CATALOG.filter((medicine) =>
      `${medicine.generic} ${medicine.brand} ${medicine.form}`
        .toLowerCase()
        .includes(query),
    );
  }, [form.medicineSearch]);

  const practitionerOptions = useMemo(
    () => Array.from(new Set([getCurrentUserName(), ...DOCTORS])),
    [],
  );

  const quantity = useMemo(
    () =>
      computeQuantity({
        dose: form.dose,
        frequency: form.frequency,
        duration: form.duration,
        durationUnit: form.durationUnit,
      }),
    [form.dose, form.frequency, form.duration, form.durationUnit],
  );

  const [medicineOpen, setMedicineOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  function clearError<K extends keyof MedicineFormState>(key: K) {
    setErrors((current) => {
      if (!current[key]) return current;

      const next = { ...current };

      delete next[key];

      return next;
    });
  }

  function setField<K extends keyof MedicineFormState>(
    key: K,
    value: MedicineFormState[K],
  ) {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === "startDate" || key === "duration" || key === "durationUnit") {
        next.endDate = autoEndDate(next);
      }

      return next;
    });

    clearError(key);
  }

  function handleMedicineChange(search: string) {
    setHighlight(0);
    setForm((current) => {
      const next = { ...current, medicineSearch: search };

      const match: MedicineItem | undefined = findMedicineByLabel(search);

      if (match) {
        next.form = match.form || current.form;
        next.strength = match.strength || current.strength;
      }

      return next;
    });

    clearError("medicineSearch");
    setMedicineOpen(true);
  }

  function handleMedicineSelect(medicine: MedicineItem) {
    setHighlight(0);
    setForm((current) => ({
      ...current,
      medicineSearch: medicineLabel(medicine),
      form: medicine.form || current.form,
      strength: medicine.strength || current.strength,
    }));

    clearError("medicineSearch");
    setMedicineOpen(false);
  }

  function handleMedicineKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (medicineMatches.length > 0) {
        setHighlight((h) => (h + 1) % medicineMatches.length);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();

      if (medicineMatches.length > 0) {
        setHighlight((h) => (h - 1 + medicineMatches.length) % medicineMatches.length);
      }
    } else if (event.key === "Enter") {
      const match =
        medicineOpen && medicineMatches[highlight]
          ? medicineMatches[highlight]
          : findMedicineByLabel(form.medicineSearch);

      if (match) {
        event.preventDefault();
        handleMedicineSelect(match);
      }
    } else if (event.key === "Escape") {
      setMedicineOpen(false);
    }
  }

  function handlePriorityChange(value: Priority) {
    setForm((current) => ({
      ...current,
      priority: value,
      statDose: value === "STAT",
      sos: value === "PRN",
    }));

    clearError("priority");
  }

  function handleClinicalToggle(key: BooleanFormKey, checked: boolean) {
    setForm((current) => {
      const next = { ...current, [key]: checked };

      if (key === "statDose") {
        if (checked) {
          next.priority = "STAT";
          next.sos = false;
        } else if (current.priority === "STAT") {
          next.priority = "Routine";
        }
      }

      if (key === "sos") {
        if (checked) {
          next.priority = "PRN";
          next.statDose = false;
        } else if (current.priority === "PRN") {
          next.priority = "Routine";
        }
      }

      return next;
    });

    clearError(key);
  }

  function toggleSchedule(option: string) {
    setForm((current) => ({
      ...current,
      schedule: current.schedule.includes(option)
        ? current.schedule.filter((item) => item !== option)
        : [...current.schedule, option],
    }));
  }

  function handleClear() {
    setErrors({});
    setForm(createEmptyForm());
    setMedicineOpen(false);
  }

  function handleSave() {
    const nextErrors: Partial<Record<keyof MedicineFormState, string>> = {};

    if (!form.medicineSearch.trim()) {
      nextErrors.medicineSearch = "Select or enter a medicine";
    }

    if (!form.form.trim()) nextErrors.form = "Required";
    if (!form.strength.trim()) nextErrors.strength = "Required";
    if (!form.dose.trim()) nextErrors.dose = "Required";
    if (!form.frequency) nextErrors.frequency = "Required";
    if (!form.route) nextErrors.route = "Required";
    if (!form.duration.trim()) nextErrors.duration = "Required";
    if (!form.startDate) nextErrors.startDate = "Required";
    if (!form.practitioner.trim()) nextErrors.practitioner = "Required";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const actor = getCurrentUserName();

    const values: Omit<Medication, "id" | keyof AuditFields> = {
      drug: form.medicineSearch.trim(),
      form: form.form.trim(),
      strength: form.strength.trim(),
      priority: form.priority,
      route: form.route,
      frequency: form.frequency,
      unit: form.unit,
      frequencyType: form.frequencyType,
      dose: form.dose.trim(),
      schedule: form.schedule.join(", "),
      duration: form.duration.trim(),
      durationUnit: form.durationUnit,
      instructions: form.instructions,
      quantity: quantity || "",
      remarks: form.remarks.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      statDose: form.statDose,
      sos: form.sos,
      patientOwnMed: form.patientOwnMed,
      taperDose: form.taperDose,
      prescribedBy: form.practitioner.trim(),
      status: editing ? editing.status : ("Prescribed" as MedStatus),
    };

    if (editing) {
      updateMedication(patient.id, editing.id, values, actor);
    } else {
      addMedication(patient.id, values, actor);
    }

    onOpenChange(false);
  }

  const admission = patient.admission;

  const age = getAge(patient.dateOfBirth);

  const hospitalDay = admission
    ? getHospitalDay(admission.admittedAt)
    : "\u2014";

  const bannerFields = [
    { label: "UHID", value: patient.uhid },
    { label: "Patient Name", value: getPatientFullName(patient) },
    { label: "Age", value: age !== null ? `${age} Y` : "\u2014" },
    { label: "Gender", value: GENDER_LABELS[patient.gender] },
    { label: "Practitioner", value: admission?.consultantName ?? "\u2014" },
    { label: "Department", value: admission ? "General Medicine" : "\u2014" },
    {
      label: "Admission Date",
      value: admission
        ? format(new Date(admission.admittedAt), "dd MMM yyyy")
        : "\u2014",
    },
    {
      label: "Admission Time",
      value: admission
        ? format(new Date(admission.admittedAt), "hh:mm a")
        : "\u2014",
    },
    { label: "Hospital Day", value: hospitalDay },
    {
      label: "Bed Number",
      value: admission ? `Bed ${admission.bedNumber}` : "\u2014",
    },
    { label: "Nursing Unit", value: admission?.ward ?? "\u2014" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[min(1160px,calc(100vw-2rem))]
          max-w-[calc(100vw-2rem)]
          gap-0
          rounded-[8px]
          border
          border-[#e5bcbc]
          p-0
          shadow-2xl
          ring-0
          sm:max-w-none
        "
      >
        <div className="flex items-center justify-between border-b border-[#e5bcbc] px-5 py-4">
          <DialogTitle className="text-2xl font-semibold text-[#333333]">
            {editing ? "Edit Medicine" : "Add Medicine"}
          </DialogTitle>

          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="cursor-pointer rounded-full p-2 text-[#777777] transition-colors hover:bg-[#f0f0f0] hover:text-[#333333]"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogClose>
        </div>

        <div className="px-5 pt-4">
          <div className="rounded-[6px] border border-[#e7bcbc] bg-[#fff5f5] p-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {bannerFields.map((field) => (
                <BannerField key={field.label} {...field} />
              ))}
            </div>
          </div>
        </div>

        <div
          className="max-h-[calc(100vh-360px)] space-y-3 overflow-y-auto px-5 py-4"
          onKeyDown={(event) => {
            if (event.ctrlKey && event.key === "Enter") {
              event.preventDefault();
              handleSave();
            }
          }}
        >
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <Field
              label="Medicine"
              required
              error={errors.medicineSearch}
              className="col-span-2 lg:col-span-3"
            >
              <div className="relative">
                <Input
                  className="h-10"
                  placeholder="Search generic or brand medicine..."
                  value={form.medicineSearch}
                  onChange={(event) =>
                    handleMedicineChange(event.target.value)
                  }
                  onFocus={() => setMedicineOpen(true)}
                  onBlur={() => setMedicineOpen(false)}
                  onKeyDown={handleMedicineKeyDown}
                />

                {medicineOpen && medicineMatches.length > 0 && (
                  <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[#e5c5c5] bg-white py-1 shadow-lg">
                    {medicineMatches.map((medicine, index) => (
                      <li key={medicine.brand}>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setHighlight(index)}
                          onClick={() => handleMedicineSelect(medicine)}
                          className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm ${
                            index === highlight
                              ? "bg-[#fdf3f3]"
                              : "hover:bg-[#fdf3f3]"
                          }`}
                        >
                          <span className="font-medium text-[#333333]">
                            {medicine.generic}
                          </span>

                          <span className="text-[#999999]">
                            ({medicine.brand} · {medicine.strength})
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {medicineOpen && medicineMatches.length === 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#e5c5c5] bg-white px-3 py-2 text-sm text-[#888888] shadow-lg">
                    No medicines found
                  </div>
                )}
              </div>
            </Field>

            <Field label="Form" required error={errors.form}>
              <Select
                value={form.form}
                onValueChange={(value) => setField("form", value)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent>
                  {MEDICINE_FORMS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Strength" required error={errors.strength}>
              <Input
                className="h-10"
                value={form.strength}
                onChange={(event) => setField("strength", event.target.value)}
                placeholder="e.g. 650 mg"
              />
            </Field>

            <Field label="Priority">
              <Select
                value={form.priority}
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {PRIORITIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <Field label="Dose" required error={errors.dose}>
              <Input
                className="h-10"
                inputMode="decimal"
                value={form.dose}
                onChange={(event) => setField("dose", event.target.value)}
                placeholder="e.g. 1"
              />
            </Field>

            <Field label="Unit">
              <Select
                value={form.unit}
                onValueChange={(value) => setField("unit", value)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent>
                  {DOSE_UNITS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Frequency Type">
              <RadioGroup
                value={form.frequencyType}
                onValueChange={(value) =>
                  setField("frequencyType", value as "Daily" | "Weekly")
                }
                className="flex h-10 items-center gap-3"
              >
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="Daily" id="freq-daily" />

                  <Label
                    htmlFor="freq-daily"
                    className="cursor-pointer text-[11px] font-medium text-[#555555]"
                  >
                    Daily
                  </Label>
                </div>

                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="Weekly" id="freq-weekly" />

                  <Label
                    htmlFor="freq-weekly"
                    className="cursor-pointer text-[11px] font-medium text-[#555555]"
                  >
                    Weekly
                  </Label>
                </div>
              </RadioGroup>
            </Field>

            <Field label="Frequency" required error={errors.frequency}>
              <Select
                value={form.frequency}
                onValueChange={(value) => setField("frequency", value)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent>
                  {FREQUENCY_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Schedule" className="col-span-2">
              <div className="flex h-10 flex-wrap items-center gap-x-4 gap-y-1">
                {SCHEDULE_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-1.5"
                  >
                    <Checkbox
                      checked={form.schedule.includes(option)}
                      onCheckedChange={() => toggleSchedule(option)}
                    />

                    <span className="text-[11px] font-medium text-[#555555]">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <Field label="Route" required error={errors.route}>
              <Select
                value={form.route}
                onValueChange={(value) => setField("route", value)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent>
                  {ROUTE_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Duration" required error={errors.duration}>
              <Input
                className="h-10"
                inputMode="decimal"
                value={form.duration}
                onChange={(event) => setField("duration", event.target.value)}
                placeholder="e.g. 5"
              />
            </Field>

            <Field label="Duration Unit">
              <Select
                value={form.durationUnit}
                onValueChange={(value) =>
                  setField("durationUnit", value as DurationUnit)
                }
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {DURATION_UNITS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Instructions">
              <Select
                value={form.instructions}
                onValueChange={(value) => setField("instructions", value)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent>
                  {INSTRUCTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Quantity (Auto)" className="col-span-2">
              <Input
                className="h-10 bg-[#f5f5f5] text-[#555555]"
                value={quantity || "\u2014"}
                readOnly
                title="Dose × Frequency × Duration"
              />
            </Field>
          </div>

          <Field label="Remarks">
            <Textarea
              rows={2}
              className="min-h-10 resize-none"
              value={form.remarks}
              onChange={(event) => setField("remarks", event.target.value)}
              placeholder="Additional clinical notes..."
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Start Date & Time" required error={errors.startDate}>
              <Input
                type="datetime-local"
                className="h-10"
                value={form.startDate}
                onChange={(event) => setField("startDate", event.target.value)}
              />
            </Field>

            <Field label="End Date & Time (Optional)">
              <Input
                type="datetime-local"
                className="h-10"
                value={form.endDate}
                onChange={(event) => setField("endDate", event.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
            <div className="rounded-[6px] border border-[#e5c5c5] bg-[#fff8f8] p-3 lg:col-span-4">
              <p className="mb-2 text-[11px] font-medium text-[#777777]">
                Clinical Options
              </p>

              <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                {CLINICAL_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex cursor-pointer items-center gap-1.5"
                  >
                    <Checkbox
                      checked={form[option.key]}
                      onCheckedChange={(checked) =>
                        handleClinicalToggle(option.key, checked === true)
                      }
                    />

                    <span className="text-[11px] font-medium text-[#555555]">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Field
              label="Ordering Practitioner"
              required
              error={errors.practitioner}
              className="lg:col-span-2"
            >
              <Select
                value={form.practitioner}
                onValueChange={(value) => setField("practitioner", value)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {practitionerOptions.map((doctor) => (
                    <SelectItem key={doctor} value={doctor}>
                      {doctor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-b-[8px] border-t border-[#e5bcbc] bg-[#fafafa] px-5 py-3.5">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 min-w-[120px]"
            onClick={handleClear}
          >
            Clear
          </Button>

          <Button
            type="button"
            size="lg"
            className="h-10 min-w-[120px] bg-[#d9534f] text-white hover:bg-[#c94f4b]"
            onClick={handleSave}
          >
            {editing ? "Save Changes" : "Add Medicine"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
