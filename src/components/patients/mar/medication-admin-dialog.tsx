"use client";

import { useMemo, useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  setMedicationAdministration,
  type MARAdministrationStatus,
  type Medication,
  type MedicationAdministration,
} from "@/lib/patients/clinical-store";
import { getCurrentUserName, nowISTDateTimeInputValue } from "@/lib/patients/audit";
import { formatMedDateTime, ROUTE_OPTIONS } from "@/lib/patients/medicine-data";
import { diffMinutes } from "@/lib/patients/mar";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: Array<{ value: MARAdministrationStatus; label: string }> = [
  { value: "Administered", label: "Administered" },
  { value: "Delayed", label: "Delayed" },
  { value: "Missed", label: "Missed" },
];

const INJECTION_ROUTES = new Set(["IV", "IM", "SC"]);

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <Label className="text-[11px] font-medium text-[#555555]">{label}</Label>

      {children}

      {error && <p className="text-[10px] font-medium text-[#c62828]">{error}</p>}
    </div>
  );
}

export function MedicationAdminDialog({
  open,
  onOpenChange,
  patientId,
  medication,
  scheduledAt,
  existing,
  initialStatus = "Administered",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  medication: Medication;
  scheduledAt: string;
  existing?: MedicationAdministration;
  initialStatus?: MARAdministrationStatus;
}) {
  const [form, setForm] = useState({
    status: existing?.status ?? initialStatus,
    givenAt: existing?.givenAt ?? nowISTDateTimeInputValue(),
    dose: existing?.dose ?? medication.dose,
    route: existing?.route ?? medication.route,
    administeredBy: existing?.administeredBy ?? getCurrentUserName(),
    batchNumber: existing?.batchNumber ?? "",
    expiryDate: existing?.expiryDate ?? "",
    site: existing?.site ?? "",
    remarks: existing?.remarks ?? "",
    reason: existing?.reason ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const needsSite = useMemo(() => INJECTION_ROUTES.has(form.route), [form.route]);

  const isStatOrPrn =
    medication.statDose ||
    medication.sos ||
    medication.priority === "STAT" ||
    medication.priority === "PRN";

  const minutesRelativeToSchedule = form.givenAt
    ? diffMinutes(form.givenAt, scheduledAt)
    : null;

  const timing =
    minutesRelativeToSchedule === null
      ? null
      : minutesRelativeToSchedule < -15
        ? "early"
        : minutesRelativeToSchedule > 15
          ? "delayed"
          : "on-time";

  const earlyAdminReasonRequired =
    form.status === "Administered" && timing === "early" && !isStatOrPrn;

  function setField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    const nextErrors: Record<string, string> = {};

    if (!form.givenAt) nextErrors.givenAt = "Required";
    if (!form.dose.trim()) nextErrors.dose = "Required";
    if (!form.route.trim()) nextErrors.route = "Required";

    if (form.status !== "Administered" && !form.reason.trim()) {
      nextErrors.reason = "A reason is required for this status";
    }

    if (earlyAdminReasonRequired && !form.reason.trim()) {
      nextErrors.reason = "A reason is required for early administration";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setMedicationAdministration(
      patientId,
      medication.id,
      scheduledAt,
      {
        status: form.status,
        givenAt: form.givenAt,
        dose: form.dose.trim(),
        route: form.route,
        administeredBy: form.administeredBy.trim(),
        batchNumber: form.batchNumber.trim() || undefined,
        expiryDate: form.expiryDate || undefined,
        site: form.site.trim() || undefined,
        remarks: form.remarks.trim() || undefined,
        reason: form.reason.trim() || undefined,
      },
      getCurrentUserName(),
    );

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden rounded-[8px] border border-[#e5bcbc] p-0 shadow-2xl ring-0 sm:max-w-xl">
        <div className="flex items-center justify-between border-b border-[#e5bcbc] px-5 py-4">
          <div>
            <DialogTitle className="text-lg font-semibold text-[#333333]">
              Administer Medication
            </DialogTitle>

            <p className="mt-0.5 text-[11px] text-[#777777]">
              {medication.drug} · {medication.form ?? "Medication"} ·{" "}
              {medication.strength ?? ""} · {medication.dose}{" "}
              {medication.unit ?? ""}
            </p>
          </div>

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

        <div className="max-h-[calc(100vh-280px)] space-y-3 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[6px] border border-[#e7bcbc] bg-[#fff5f5] px-3 py-2.5 text-[11px]">
            <span className="font-semibold text-[#555555]">Scheduled Time:</span>

            <span className="font-semibold text-[#d9534f]">
              {formatMedDateTime(scheduledAt)}
            </span>

            {timing && (
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase",
                  timing === "early" &&
                    "bg-[#fdf3d7] text-[#8a6d1a]",
                  timing === "on-time" &&
                    "bg-[#e8f5e9] text-[#2e7d32]",
                  timing === "delayed" &&
                    "bg-[#fdecea] text-[#c62828]",
                )}
              >
                {timing === "early"
                  ? "Early Administration"
                  : timing === "delayed"
                    ? "Delayed"
                    : "On Time"}
              </span>
            )}

            <span className="mx-1 text-[#cccccc]">|</span>

            <span className="font-semibold text-[#555555]">
              Frequency: {medication.frequency}
            </span>

            <span className="mx-1 text-[#cccccc]">|</span>

            <span className="font-semibold text-[#555555]">
              Dose: {medication.dose} {medication.unit ?? ""}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setField("status", value as MARAdministrationStatus)
                }
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Actual Administration Time" error={errors.givenAt}>
              <Input
                type="datetime-local"
                className="h-10"
                value={form.givenAt}
                onChange={(event) => setField("givenAt", event.target.value)}
              />
            </Field>

            <Field label="Dose Given" error={errors.dose}>
              <Input
                className="h-10"
                value={form.dose}
                onChange={(event) => setField("dose", event.target.value)}
                placeholder="e.g. 1"
              />
            </Field>

            <Field label="Route" error={errors.route}>
              <Select
                value={form.route}
                onValueChange={(value) => setField("route", value)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {ROUTE_OPTIONS.map((route) => (
                    <SelectItem key={route} value={route}>
                      {route}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Administered By">
              <Input
                className="h-10"
                value={form.administeredBy}
                onChange={(event) =>
                  setField("administeredBy", event.target.value)
                }
              />
            </Field>

            <Field label="Batch Number">
              <Input
                className="h-10"
                value={form.batchNumber}
                onChange={(event) => setField("batchNumber", event.target.value)}
                placeholder="e.g. A-12345"
              />
            </Field>

            <Field label="Expiry Date">
              <Input
                type="date"
                className="h-10"
                value={form.expiryDate}
                onChange={(event) => setField("expiryDate", event.target.value)}
              />
            </Field>

            {needsSite && (
              <Field label="Site (Injection)">
                <Input
                  className="h-10"
                  value={form.site}
                  onChange={(event) => setField("site", event.target.value)}
                  placeholder="e.g. Left deltoid"
                />
              </Field>
            )}
          </div>

          {(form.status !== "Administered" || earlyAdminReasonRequired) && (
            <Field label="Reason" error={errors.reason}>
              <Textarea
                rows={2}
                className="min-h-10 resize-none"
                value={form.reason}
                onChange={(event) => setField("reason", event.target.value)}
                placeholder={
                  earlyAdminReasonRequired
                    ? "Why is this dose being administered early?"
                    : form.status === "Missed"
                      ? "Why was this dose missed?"
                      : "Why was this dose delayed?"
                }
              />
            </Field>
          )}

          <Field label="Remarks">
            <Textarea
              rows={2}
              className="min-h-10 resize-none"
              value={form.remarks}
              onChange={(event) => setField("remarks", event.target.value)}
              placeholder="Additional notes for this administration"
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 rounded-b-[8px] border-t border-[#e5bcbc] bg-[#fafafa] px-5 py-3.5">
          <Button
            type="button"
            variant="outline"
            className="h-9 min-w-[100px]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="h-9 min-w-[140px] bg-[#2e7d32] text-white hover:bg-[#256827]"
            onClick={handleSave}
          >
            Administer Medication
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
