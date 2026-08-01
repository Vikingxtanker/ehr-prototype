"use client";

import { useMemo, useState } from "react";

import { format } from "date-fns";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  History,
  MoreHorizontal,
  Pause,
  Printer,
  RefreshCw,
  X,
} from "lucide-react";

import { useClinicalRecords } from "@/hooks/use-clinical-records";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/menu";

import {
  hydrateClinicalRecords,
  setMedicationAdministration,
  stopMedication,
  toggleHoldMedication,
  type MARAdministrationStatus,
  type Medication,
  type MedicationAdministration,
} from "@/lib/patients/clinical-store";
import { getCurrentUserName } from "@/lib/patients/audit";
import {
  formatMedDateTime,
  MEDICINE_CATALOG,
  medicineLabel,
} from "@/lib/patients/medicine-data";
import {
  buildMarDateRange,
  dateKeyToDate,
  getDoseState,
  getDoseTimes,
  getTherapyProgress,
  getTodayDoseSummary,
  groupMedications,
  nowLocalDateTime,
  type MarGroup,
} from "@/lib/patients/mar";
import { type Patient } from "@/lib/types/patient";
import { cn } from "@/lib/utils";
import { MedicineDialog } from "../summary/medicine-dialog";
import { MedicationAdminDialog } from "./medication-admin-dialog";
import {
  AllAdministrationsDialog,
  MedicationHistoryDialog,
} from "./mar-history-dialog";

function formatTime12(time24: string): string {
  const [hour, minute] = time24.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

function formatMedDate(value: string | undefined, withTime: boolean): string {
  if (!value) return "\u2014";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "\u2014";

  return format(date, withTime ? "dd MMM yyyy HH:mm" : "dd MMM yyyy");
}

const LEGEND_ITEMS: Array<{ label: string; color: string }> = [
  { label: "Pending", color: "bg-[#607d8b]" },
  { label: "Administered", color: "bg-[#2e7d32]" },
  { label: "Missed / Unable to Administer", color: "bg-[#c62828]" },
  { label: "Delayed", color: "bg-[#ef6c00]" },
  { label: "Scheduled", color: "bg-[#4a90e2]" },
];

function MarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-[#e5e5e5] px-3 py-2">
      {LEGEND_ITEMS.map((item) => (
        <span
          key={item.label}
          className="flex items-center gap-1.5 text-[10px] font-medium text-[#555555]"
        >
          <span className={cn("h-2 w-2 rounded-full", item.color)} />

          {item.label}
        </span>
      ))}
    </div>
  );
}

const STATUS_FILTER_OPTIONS = [
  "All",
  "Active",
  "Scheduled",
  "Administered",
  "Missed",
  "Discontinued",
  "Completed",
] as const;

type StatusFilter = (typeof STATUS_FILTER_OPTIONS)[number];

function medHasAdministered(
  medicationId: string,
  administrations: MedicationAdministration[],
): boolean {
  return administrations.some(
    (item) =>
      item.medicationId === medicationId && item.status === "Administered",
  );
}

function medHasMissed(
  medication: Medication,
  dates: string[],
  administrations: MedicationAdministration[],
  now: string,
): boolean {
  for (const date of dates) {
    for (const time of getDoseTimes(medication)) {
      const scheduledAt = `${date}T${time}`;

      const event = administrations.find(
        (item) =>
          item.medicationId === medication.id &&
          item.scheduledAt === scheduledAt,
      );

      const state = getDoseState(medication, scheduledAt, now, event);

      if (state.key === "missed" || state.key === "due") return true;
    }
  }

  return false;
}

function medHasScheduled(
  medication: Medication,
  dates: string[],
  administrations: MedicationAdministration[],
  now: string,
): boolean {
  for (const date of dates) {
    for (const time of getDoseTimes(medication)) {
      const scheduledAt = `${date}T${time}`;

      const event = administrations.find(
        (item) =>
          item.medicationId === medication.id &&
          item.scheduledAt === scheduledAt,
      );

      const state = getDoseState(medication, scheduledAt, now, event);

      if (state.key === "scheduled" || state.key === "due") return true;
    }
  }

  return false;
}

function ActionButton({
  label,
  onClick,
  title,
}: {
  label: string;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="h-[26px] cursor-pointer rounded-[4px] border border-[#b9b9b9] bg-white px-1.5 text-[10px] font-semibold text-[#555555] transition-colors hover:border-[#d9534f] hover:bg-[#fdecea] hover:text-[#c62828]"
    >
      {label}
    </button>
  );
}

function AdministrationTooltip({
  record,
  time,
}: {
  record: MedicationAdministration;
  time: string;
}) {
  const details: Array<{ label: string; value?: string }> = [
    { label: "Nurse", value: record.administeredBy },
    { label: "Batch", value: record.batchNumber },
    { label: "Expiry", value: record.expiryDate },
    { label: "Site", value: record.site },
    { label: "Remarks", value: record.remarks },
  ];

  return (
    <>
      <span className="text-[11px] font-semibold text-white">
        Administered ·{" "}
        {record.givenAt
          ? formatTime12(record.givenAt.slice(11, 16))
          : formatTime12(time)}
      </span>

      {details.map(
        (item) =>
          item.value && (
            <span key={item.label} className="text-[11px] text-white/80">
              {item.label}: {item.value}
            </span>
          ),
      )}
    </>
  );
}

function DoseSlot({
  medication,
  date,
  time,
  now,
  event,
  onAdminister,
  onAction,
}: {
  medication: Medication;
  date: string;
  time: string;
  now: string;
  event?: MedicationAdministration;
  onAdminister: (
    medication: Medication,
    scheduledAt: string,
    existing?: MedicationAdministration,
  ) => void;
  onAction: (
    action: string,
    medication: Medication,
    scheduledAt: string,
    existing?: MedicationAdministration,
  ) => void;
}) {
  const scheduledAt = `${date}T${time}`;
  const state = getDoseState(medication, scheduledAt, now, event);

  const isStatOrPrn =
    medication.statDose ||
    medication.sos ||
    medication.priority === "STAT" ||
    medication.priority === "PRN";

  if (state.key === "inactive") {
    return (
      <div className="flex h-10 flex-col items-center justify-center gap-1">
        <span className="text-[8px] font-semibold tracking-wide text-[#b9b9b9]">
          {time}
        </span>

        <span className="text-[10px] text-[#dddddd]">{"\u2014"}</span>
      </div>
    );
  }

  return (
    <div className="flex h-10 flex-col items-center justify-center gap-1">
      <span className="text-[8px] font-semibold tracking-wide text-[#9a9a9a]">
        {time}
      </span>

      <div className="flex items-center justify-center gap-0.5">
      {state.key === "due" && (
        <button
          type="button"
          onClick={() => onAdminister(medication, scheduledAt, event)}
          className="h-[26px] cursor-pointer rounded-[4px] border border-[#4a90e2] bg-[#eaf2fb] px-2 text-[9px] font-bold tracking-wide text-[#1565c0] transition-colors hover:bg-[#4a90e2] hover:text-white"
        >
          GIVE NOW
        </button>
      )}

      {state.key === "scheduled" && isStatOrPrn && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onAdminister(medication, scheduledAt, event)}
              className="h-[26px] cursor-pointer rounded-[4px] border border-[#4a90e2] bg-[#eaf2fb] px-2 text-[9px] font-bold tracking-wide text-[#1565c0] transition-colors hover:bg-[#4a90e2] hover:text-white"
            >
              GIVE NOW
            </button>
          </TooltipTrigger>

          <TooltipContent
            side="top"
            align="center"
            className="max-w-xs flex-col items-start gap-1"
          >
            <span className="text-[11px] font-semibold text-white">
              Immediate Administration
            </span>

            <span className="text-[11px] text-white/80">
              STAT / PRN orders may be administered without waiting for the
              scheduled time.
            </span>
          </TooltipContent>
        </Tooltip>
      )}

      {state.key === "scheduled" && !isStatOrPrn && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onAdminister(medication, scheduledAt, event)}
              className="h-[26px] cursor-pointer rounded-[4px] border border-[#b0b0b0] bg-[#fafafa] px-2 text-[9px] font-bold tracking-wide text-[#555555] transition-colors hover:bg-[#4a4a4a] hover:text-white"
            >
              ADMINISTER
            </button>
          </TooltipTrigger>

          <TooltipContent
            side="top"
            align="center"
            className="max-w-xs flex-col items-start gap-1"
          >
            <span className="text-[11px] font-semibold text-white">
              Early Administration
            </span>

            <span className="text-[11px] text-white/80">
              Dose is not yet due. Administering early requires a documented
              reason.
            </span>

            <span className="text-[11px] text-white/80">
              Scheduled Time: {time}
            </span>
          </TooltipContent>
        </Tooltip>
      )}

      {state.key === "administered" && event && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex cursor-default flex-col items-center leading-none">
              <Check className="h-3 w-3 text-[#2e7d32]" />

              <span className="mt-0.5 text-[9px] font-bold text-[#2e7d32]">
                {event.givenAt
                  ? formatTime12(event.givenAt.slice(11, 16))
                  : time}
              </span>
            </span>
          </TooltipTrigger>

          <TooltipContent
            side="top"
            align="center"
            className="max-w-xs flex-col items-start gap-1"
          >
            <AdministrationTooltip record={event} time={time} />
          </TooltipContent>
        </Tooltip>
      )}

      {state.key === "missed" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex cursor-default flex-col items-center leading-none">
              <X className="h-3 w-3 text-[#c62828]" />

              <span className="mt-0.5 text-[8px] font-bold tracking-wide text-[#c62828]">
                MISSED
              </span>
            </span>
          </TooltipTrigger>

          {(event?.remarks || event?.reason) && (
            <TooltipContent
              side="top"
              align="center"
              className="max-w-xs flex-col items-start gap-1"
            >
              {event?.reason && (
                <span className="text-[11px] text-white/80">
                  Reason: {event.reason}
                </span>
              )}

              {event?.remarks && (
                <span className="text-[11px] text-white/80">
                  Remarks: {event.remarks}
                </span>
              )}
            </TooltipContent>
          )}
        </Tooltip>
      )}

      {state.key === "delayed" && event && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex cursor-default flex-col items-center leading-none">
              <Clock className="h-3 w-3 text-[#ef6c00]" />

              <span className="mt-0.5 text-[9px] font-bold text-[#ef6c00]">
                {event.givenAt
                  ? formatTime12(event.givenAt.slice(11, 16))
                  : time}
              </span>
            </span>
          </TooltipTrigger>

          <TooltipContent
            side="top"
            align="center"
            className="max-w-xs flex-col items-start gap-1"
          >
            <AdministrationTooltip record={event} time={time} />
          </TooltipContent>
        </Tooltip>
      )}

      {state.key === "held" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex cursor-default flex-col items-center leading-none">
              <Pause className="h-3 w-3 text-[#757575]" />

              <span className="mt-0.5 text-[8px] font-bold tracking-wide text-[#757575]">
                HELD
              </span>
            </span>
          </TooltipTrigger>

          {(event?.remarks || event?.reason) && (
            <TooltipContent
              side="top"
              align="center"
              className="max-w-xs flex-col items-start gap-1"
            >
              {event?.reason && (
                <span className="text-[11px] text-white/80">
                  Reason: {event.reason}
                </span>
              )}

              {event?.remarks && (
                <span className="text-[11px] text-white/80">
                  Remarks: {event.remarks}
                </span>
              )}
            </TooltipContent>
          )}
        </Tooltip>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Dose actions"
          className="cursor-pointer rounded p-0.5 text-[#bbbbbb] transition-colors hover:bg-[#f0f0f0] hover:text-[#333333]"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-36">
          <DropdownMenuItem
            onClick={() => onAction("administer", medication, scheduledAt, event)}
          >
            Administer
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onAction("hold", medication, scheduledAt, event)}
          >
            Hold
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onAction("skip", medication, scheduledAt, event)}
          >
            Skip
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onAction("reason", medication, scheduledAt, event)}
          >
            Record Reason
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onAction("history", medication, scheduledAt, event)}
          >
            View History
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </div>
  );
}

export function MarChart({ patient }: { patient: Patient }) {
  const records = useClinicalRecords(patient.id);

  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [expandedMeds, setExpandedMeds] = useState<Set<string>>(new Set());

  const [adminTarget, setAdminTarget] = useState<{
    medication: Medication;
    scheduledAt: string;
    existing?: MedicationAdministration;
    initialStatus?: MARAdministrationStatus;
  } | null>(null);

  const [stopTarget, setStopTarget] = useState<Medication | null>(null);
  const [viewMed, setViewMed] = useState<Medication | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editMed, setEditMed] = useState<Medication | null>(null);

  const now = useMemo(() => nowLocalDateTime(), []);

  const { active, stopped, completed } = useMemo(() => {
    const active: Medication[] = [];
    const stopped: Medication[] = [];
    const completed: Medication[] = [];

    for (const med of records.medications) {
      if (med.status === "Stopped") stopped.push(med);
      else if (med.status === "Completed") completed.push(med);
      else active.push(med);
    }

    return { active, stopped, completed };
  }, [records.medications]);

  const dateRange = useMemo(
    () => buildMarDateRange(records.medications),
    [records.medications],
  );

  const eventMap = useMemo(() => {
    const map = new Map<string, MedicationAdministration>();

    for (const item of records.administrations) {
      map.set(`${item.medicationId}|${item.scheduledAt}`, item);
    }

    return map;
  }, [records.administrations]);

  const groupedActive = useMemo(
    () => groupMedications(active),
    [active],
  );

  const timelineGroups = useMemo(() => {
    if (statusFilter === "Discontinued") {
      return stopped.length > 0
        ? [
            {
              id: "discontinued",
              label: "Discontinued Medications",
              medications: stopped,
            },
          ]
        : [];
    }

    if (statusFilter === "Completed") {
      return completed.length > 0
        ? [
            {
              id: "completed",
              label: "Completed Medications",
              medications: completed,
            },
          ]
        : [];
    }

    const base: MarGroup[] = groupedActive;

    if (statusFilter === "Scheduled") {
      return base
        .map((group) => ({
          ...group,
          medications: group.medications.filter((med) =>
            medHasScheduled(med, dateRange.dates, records.administrations, now),
          ),
        }))
        .filter((group) => group.medications.length > 0);
    }

    if (statusFilter === "Administered") {
      return base
        .map((group) => ({
          ...group,
          medications: group.medications.filter((med) =>
            medHasAdministered(med.id, records.administrations),
          ),
        }))
        .filter((group) => group.medications.length > 0);
    }

    if (statusFilter === "Missed") {
      return base
        .map((group) => ({
          ...group,
          medications: group.medications.filter((med) =>
            medHasMissed(med, dateRange.dates, records.administrations, now),
          ),
        }))
        .filter((group) => group.medications.length > 0);
    }

    if (!showOnlyActive) {
      return [
        ...base,
        ...(stopped.length > 0
          ? [
              {
                id: "discontinued",
                label: "Discontinued Medications",
                medications: stopped,
              },
            ]
          : []),
        ...(completed.length > 0
          ? [
              {
                id: "completed",
                label: "Completed Medications",
                medications: completed,
              },
            ]
          : []),
      ];
    }

    return base;
  }, [
    statusFilter,
    groupedActive,
    stopped,
    completed,
    showOnlyActive,
    dateRange.dates,
    records.administrations,
    now,
  ]);

  const totalMedications = timelineGroups.reduce(
    (sum, group) => sum + group.medications.length,
    0,
  );

  const columnCount = 1 + dateRange.dates.length;

  function toggleGroup(groupId: string) {
    setCollapsedGroups((current) => {
      const next = new Set(current);

      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);

      return next;
    });
  }

  function toggleExpand(medicationId: string) {
    setExpandedMeds((current) => {
      const next = new Set(current);

      if (next.has(medicationId)) next.delete(medicationId);
      else next.add(medicationId);

      return next;
    });
  }

  function handleAdminister(
    medication: Medication,
    scheduledAt: string,
    existing?: MedicationAdministration,
  ) {
    setAdminTarget({
      medication,
      scheduledAt,
      existing,
      initialStatus: "Administered",
    });
  }

  function handleDoseAction(
    action: string,
    medication: Medication,
    scheduledAt: string,
    existing?: MedicationAdministration,
  ) {
    switch (action) {
      case "administer":
        setAdminTarget({
          medication,
          scheduledAt,
          existing,
          initialStatus: "Administered",
        });
        break;

      case "hold":
        setMedicationAdministration(
          patient.id,
          medication.id,
          scheduledAt,
          { status: "Held" },
          getCurrentUserName(),
        );
        break;

      case "skip":
        setMedicationAdministration(
          patient.id,
          medication.id,
          scheduledAt,
          { status: "Missed" },
          getCurrentUserName(),
        );
        break;

      case "reason":
        setAdminTarget({
          medication,
          scheduledAt,
          existing,
          initialStatus: existing?.status ?? "Delayed",
        });
        break;

      case "history":
        setViewMed(medication);
        break;
    }
  }

  const drugAllergy =
    patient.allergies.length > 0
      ? patient.allergies.join(", ")
      : "NO KNOWN ALLERGY";

  return (
    <div className="space-y-3">
      {/* MAR Chart card */}
      <section className="rounded-[6px] border border-[#e5c5c5] bg-white">
        <div className="rounded-t-[6px] border-b border-[#e5bcbc] bg-[#6b3b38] px-3 py-2.5">
          <h1 className="text-[18px] font-semibold text-white">MAR Chart</h1>

          <p className="text-[11px] text-white/70">
            Medication Administration Record — scheduled, given, missed and
            held doses per date.
          </p>
        </div>

        <MarLegend />

        {/* Filter toolbar */}
        <div className="sticky top-0 z-20 flex min-h-12 flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-[#e5e5e5] bg-white px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold tracking-wide text-[#555555] uppercase">
              Drug Allergy
            </span>

            <span className="rounded border border-[#c62828] bg-[#fdecea] px-1.5 py-0.5 text-[10px] font-semibold text-[#c62828]">
              {drugAllergy}
            </span>
          </div>

          <label className="flex cursor-pointer items-center gap-1.5">
            <Checkbox
              checked={showOnlyActive}
              onCheckedChange={(checked) => setShowOnlyActive(checked === true)}
            />

            <span className="text-[11px] font-medium text-[#555555]">
              Show only active medications
            </span>
          </label>

          <div className="w-36">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>

              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-[11px]"
              onClick={() => window.print()}
            >
              <Printer />

              Print MAR
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-[11px]"
              onClick={() => hydrateClinicalRecords(patient.id)}
            >
              <RefreshCw />

              Refresh
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-[11px]"
              onClick={() => setHistoryOpen(true)}
            >
              <History />

              Medication History
            </Button>
          </div>
        </div>

        {/* Timeline table */}
        {totalMedications === 0 ? (
          <div className="px-3 py-12 text-center">
            <p className="text-[13px] font-semibold text-[#333333]">
              No medications to display
            </p>

            <p className="mt-1 text-[11px] text-[#777777]">
              Add medications from the Summary tab or adjust the filters above.
            </p>
          </div>
        ) : (
          <div className="max-h-[calc(100dvh-280px)] overflow-auto rounded-b-[6px]">
            <table className="w-full table-fixed border-collapse text-[11px]">
              <colgroup>
                <col style={{ width: 440, minWidth: 440 }} />
                {dateRange.dates.map((date) => (
                  <col key={date} style={{ width: 100, minWidth: 100 }} />
                ))}
              </colgroup>

              <thead>
                <tr>
                  <th className="sticky top-0 left-0 z-30 h-10 border-b border-[#555555] bg-[#626262] px-2.5 text-left text-[11px] font-semibold text-[#ffffff]">
                    Medication
                  </th>

                  {dateRange.dates.map((date) => {
                    const parsed = dateKeyToDate(date);
                    const isToday = date === dateRange.todayKey;

                    return (
                      <th
                        key={date}
                        className={cn(
                          "sticky top-0 z-20 h-10 border-b border-[#555555] px-1 text-center align-middle text-[10px] font-semibold text-[#ffffff]",
                          isToday ? "bg-[#4a4a4a]" : "bg-[#626262]",
                        )}
                      >
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <span>{format(parsed, "d MMM")}</span>

                          <span className="flex items-center gap-1 text-[9px] font-medium opacity-70">
                            {format(parsed, "EEE")}

                            {isToday && (
                              <span className="rounded bg-[#f4c7c3] px-1 text-[8px] leading-tight font-bold text-[#5c1f1c] opacity-100">
                                TODAY
                              </span>
                            )}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {timelineGroups.map((group, groupIndex) => {
                  const isCollapsed = collapsedGroups.has(group.id);
                  const isDarkGroup =
                    group.id === "discontinued" || group.id === "completed";

                  return (
                    <FragmentGroup
                      key={group.id}
                      group={group}
                      groupIndex={groupIndex}
                      isCollapsed={isCollapsed}
                      isDarkGroup={isDarkGroup}
                      columnCount={columnCount}
                      dateRange={dateRange}
                      now={now}
                      eventMap={eventMap}
                      expandedMeds={expandedMeds}
                      onToggleGroup={toggleGroup}
                      onToggleExpand={toggleExpand}
                      onAdminister={handleAdminister}
                      onDoseAction={handleDoseAction}
                      onStop={setStopTarget}
                      onView={setViewMed}
                      onEdit={setEditMed}
                      onHold={(med) =>
                        toggleHoldMedication(
                          patient.id,
                          med.id,
                          getCurrentUserName(),
                        )
                      }
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Discontinued medications */}
      <section className="overflow-hidden rounded-[6px] border border-[#e5c5c5] bg-white">
        <header className="flex h-10 shrink-0 items-center justify-between border-b border-[#eeeeee] px-3">
          <h3 className="text-[13px] font-semibold tracking-wide text-[#333333]">
            Discontinued Medications
          </h3>

          <span className="rounded-full bg-[#f3e5f5] px-2 py-0.5 text-[10px] font-semibold text-[#8e24aa]">
            {stopped.length}
          </span>
        </header>

        {stopped.length === 0 ? (
          <p className="p-3 text-[12px] text-[#888888]">
            No discontinued medications.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-[#f7f7f7] text-left text-[10px] font-semibold tracking-wide text-[#777777] uppercase">
                  <th className="px-2 py-2 font-semibold">Medication</th>
                  <th className="px-2 py-2 font-semibold">Strength</th>
                  <th className="px-2 py-2 font-semibold">Route</th>
                  <th className="px-2 py-2 font-semibold">Priority</th>
                  <th className="px-2 py-2 font-semibold">Frequency</th>
                  <th className="px-2 py-2 font-semibold">Dose</th>
                  <th className="px-2 py-2 font-semibold">Instructions</th>
                  <th className="px-2 py-2 font-semibold">Duration</th>
                  <th className="px-2 py-2 font-semibold">Start Date</th>
                  <th className="px-2 py-2 font-semibold">Stopped Date</th>
                  <th className="px-2 py-2 font-semibold">End Date</th>
                </tr>
              </thead>

              <tbody>
                {stopped.map((med) => (
                  <tr key={med.id} className="bg-[#fafafa] hover:bg-[#f5e5f0]">
                    <td className="px-2 py-2 font-semibold text-[#333333]">
                      {med.drug}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                      {med.strength ?? "\u2014"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                      {med.route || "\u2014"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                      {med.priority}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                      {med.frequency || "\u2014"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                      {med.dose}
                      {med.unit ? ` ${med.unit}` : ""}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                      {med.instructions || "\u2014"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                      {med.duration
                        ? `${med.duration} ${med.durationUnit ?? ""}`
                        : "\u2014"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                      {formatMedDateTime(med.startDate)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#c62828]">
                      {med.stoppedAt
                        ? formatMedDateTime(med.stoppedAt)
                        : "\u2014"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                      {formatMedDateTime(med.endDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Completed medications */}
      <section className="overflow-hidden rounded-[6px] border border-[#e5c5c5] bg-white">
        <header className="flex h-10 shrink-0 items-center justify-between border-b border-[#eeeeee] px-3">
          <h3 className="text-[13px] font-semibold tracking-wide text-[#333333]">
            Completed Medications
          </h3>

          <span className="rounded-full bg-[#eceff1] px-2 py-0.5 text-[10px] font-semibold text-[#546e7a]">
            {completed.length}
          </span>
        </header>

        {completed.length === 0 ? (
          <p className="p-3 text-[12px] text-[#888888]">
            No completed medications.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-[#f7f7f7] text-left text-[10px] font-semibold tracking-wide text-[#777777] uppercase">
                  <th className="px-2 py-2 font-semibold">Medication</th>
                  <th className="px-2 py-2 font-semibold">Strength</th>
                  <th className="px-2 py-2 font-semibold">Route</th>
                  <th className="px-2 py-2 font-semibold">Frequency</th>
                  <th className="px-2 py-2 font-semibold">Dose</th>
                  <th className="px-2 py-2 font-semibold">Start Date</th>
                  <th className="px-2 py-2 font-semibold">Completion Date</th>
                  <th className="px-2 py-2 font-semibold">Duration</th>
                  <th className="px-2 py-2 font-semibold">Outcome</th>
                </tr>
              </thead>

              <tbody>
                {completed.map((med) => (
                  <tr key={med.id} className="bg-[#f5f6f8] hover:bg-[#eef0f2]">
                    <td className="px-2 py-2 font-semibold text-[#444444]">
                      {med.drug}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#777777]">
                      {med.strength ?? "\u2014"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#777777]">
                      {med.route || "\u2014"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#777777]">
                      {med.frequency || "\u2014"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#777777]">
                      {med.dose}
                      {med.unit ? ` ${med.unit}` : ""}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#777777]">
                      {formatMedDateTime(med.startDate)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#777777]">
                      {med.endDate ? formatMedDateTime(med.endDate) : "\u2014"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#777777]">
                      {med.duration
                        ? `${med.duration} ${med.durationUnit ?? ""}`
                        : "\u2014"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[#2e7d32]">
                      Course completed
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Dialogs */}
      {adminTarget && (
        <MedicationAdminDialog
          key={`${adminTarget.medication.id}|${adminTarget.scheduledAt}`}
          open
          onOpenChange={(open) => {
            if (!open) setAdminTarget(null);
          }}
          patientId={patient.id}
          medication={adminTarget.medication}
          scheduledAt={adminTarget.scheduledAt}
          existing={adminTarget.existing}
          initialStatus={adminTarget.initialStatus}
        />
      )}

      <MedicationHistoryDialog
        open={viewMed !== null}
        onOpenChange={(open) => {
          if (!open) setViewMed(null);
        }}
        medication={viewMed}
        administrations={records.administrations}
      />

      <AllAdministrationsDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        administrations={records.administrations}
        medications={records.medications}
      />

      <MedicineDialog
        key={editMed?.id ?? "mar-medicine-dialog"}
        patient={patient}
        open={editMed !== null}
        onOpenChange={(open) => {
          if (!open) setEditMed(null);
        }}
        editing={editMed}
      />

      <AlertDialog
        open={stopTarget !== null}
        onOpenChange={(open) => {
          if (!open) setStopTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop medication?</AlertDialogTitle>

            <AlertDialogDescription>
              {stopTarget
                ? `This will discontinue "${stopTarget.drug}". Previous administrations are kept for the record.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              className="bg-[#c62828] text-white hover:bg-[#a02020]"
              onClick={() => {
                if (stopTarget) {
                  stopMedication(patient.id, stopTarget.id, getCurrentUserName());
                }
              }}
            >
              Stop Medication
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FragmentGroup({
  group,
  groupIndex,
  isCollapsed,
  isDarkGroup,
  columnCount,
  dateRange,
  now,
  eventMap,
  expandedMeds,
  onToggleGroup,
  onToggleExpand,
  onAdminister,
  onDoseAction,
  onStop,
  onView,
  onEdit,
  onHold,
}: {
  group: MarGroup;
  groupIndex: number;
  isCollapsed: boolean;
  isDarkGroup: boolean;
  columnCount: number;
  dateRange: { dates: string[]; todayKey: string };
  now: string;
  eventMap: Map<string, MedicationAdministration>;
  expandedMeds: Set<string>;
  onToggleGroup: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAdminister: (
    medication: Medication,
    scheduledAt: string,
    existing?: MedicationAdministration,
  ) => void;
  onDoseAction: (
    action: string,
    medication: Medication,
    scheduledAt: string,
    existing?: MedicationAdministration,
  ) => void;
  onStop: (medication: Medication) => void;
  onView: (medication: Medication) => void;
  onEdit: (medication: Medication) => void;
  onHold: (medication: Medication) => void;
}) {
  const groupBackground = isDarkGroup ? "bg-[#e9dcf0]" : "bg-[#ececec]";

  return (
    <>
      {/* Group header row */}
      <tr className={cn("border-y border-[#d9d9d9]", groupBackground)}>
        <td className={cn("sticky top-10 left-0 z-20 px-0 py-0", groupBackground)}>
          <button
            type="button"
            onClick={() => onToggleGroup(group.id)}
            className={cn(
              "flex h-8 w-full cursor-pointer items-center gap-1.5 px-2.5 text-left text-[11px] font-semibold tracking-wider uppercase",
              isDarkGroup ? "text-[#6a3d9a]" : "text-[#3f3f3f]",
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}

            {group.label}

            <span className="rounded-full bg-[#d9d9d9] px-1.5 py-px text-[10px] font-bold text-[#555555]">
              {group.medications.length}
            </span>
          </button>
        </td>

        <td
          colSpan={columnCount - 1}
          className={cn(
            "sticky top-10 z-10 px-2.5 text-[10px] font-semibold tracking-wide text-[#888888]",
            groupBackground,
          )}
        >
          {group.medications.length}{" "}
          {group.medications.length === 1 ? "medication" : "medications"}
        </td>
      </tr>

      {!isCollapsed &&
        group.medications.map((med) => (
          <FragmentMedication
            key={med.id}
            med={med}
            groupIndex={groupIndex}
            isExpanded={expandedMeds.has(med.id)}
            columnCount={columnCount}
            dateRange={dateRange}
            now={now}
            eventMap={eventMap}
            onToggleExpand={onToggleExpand}
            onAdminister={onAdminister}
            onDoseAction={onDoseAction}
            onStop={onStop}
            onView={onView}
            onEdit={onEdit}
            onHold={onHold}
          />
        ))}
    </>
  );
}

function FragmentMedication({
  med,
  groupIndex,
  isExpanded,
  columnCount,
  dateRange,
  now,
  eventMap,
  onToggleExpand,
  onAdminister,
  onDoseAction,
  onStop,
  onView,
  onEdit,
  onHold,
}: {
  med: Medication;
  groupIndex: number;
  isExpanded: boolean;
  columnCount: number;
  dateRange: { dates: string[]; todayKey: string };
  now: string;
  eventMap: Map<string, MedicationAdministration>;
  onToggleExpand: (id: string) => void;
  onAdminister: (
    medication: Medication,
    scheduledAt: string,
    existing?: MedicationAdministration,
  ) => void;
  onDoseAction: (
    action: string,
    medication: Medication,
    scheduledAt: string,
    existing?: MedicationAdministration,
  ) => void;
  onStop: (medication: Medication) => void;
  onView: (medication: Medication) => void;
  onEdit: (medication: Medication) => void;
  onHold: (medication: Medication) => void;
}) {
  const rowBackground = groupIndex % 2 === 1 ? "bg-[#fcfcfc]" : "bg-white";

  const times = getDoseTimes(med);

  const medEvents = Array.from(eventMap.values()).filter(
    (item) => item.medicationId === med.id,
  );

  const todaySummary = getTodayDoseSummary(
    med,
    dateRange.todayKey,
    medEvents,
    now,
  );

  const progress = getTherapyProgress(med);

  const catalogMatch = MEDICINE_CATALOG.find(
    (item) => medicineLabel(item).toLowerCase() === med.drug.toLowerCase(),
  );

  const medicationCell = (
    <td
      className={cn(
        "sticky left-0 z-10 border-r border-[#e5e5e5] px-2.5 py-2 align-top group-hover:bg-[#fdf3f3]",
        rowBackground,
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <button
          type="button"
          onClick={() => onToggleExpand(med.id)}
          className="flex cursor-pointer items-center gap-1 text-left text-[13px] leading-snug font-bold text-[#2b2b2b] hover:text-[#d9534f]"
        >
          <span className="min-w-0">{med.drug}</span>

          {isExpanded ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-[#aaaaaa]" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-[#aaaaaa]" />
          )}
        </button>

        <p className="text-[11px] leading-snug text-[#555555]">
          {catalogMatch?.generic ?? med.drug.split(" (")[0]}
        </p>

        <p className="text-[11px] leading-snug text-[#555555]">
          {med.strength || "\u2014"} · {med.route || "\u2014"} ·{" "}
          {med.frequency || "\u2014"}
        </p>

        <p className="text-[11px] leading-snug text-[#3f3f3f]">
          {med.dose}
          {med.unit ? ` ${med.unit}` : ""}
        </p>

        {med.instructions && (
          <p className="text-[11px] leading-snug text-[#555555]">
            Instructions: {med.instructions}
          </p>
        )}

        <p className="text-[10px] leading-snug text-[#777777]">
          Start: {formatMedDate(med.startDate, true)}
        </p>

        <p className="text-[10px] leading-snug text-[#777777]">
          End: {formatMedDate(med.endDate, false)}
        </p>

        {progress && (
          <p className="text-[10px] leading-snug font-bold text-[#d9534f]">
            Day {progress.current}
            {progress.total > 0 ? ` of ${progress.total}` : ""}
          </p>
        )}

        {times.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-medium text-[#666666]">
            <span className="font-bold text-[#444444]">Today:</span>

            <span className="text-[#2e7d32]">{todaySummary.given} Given</span>

            <span className="text-[#607d8b]">
              {todaySummary.pending} Pending
            </span>

            <span className="text-[#c62828]">
              {todaySummary.missed} Missed
            </span>
          </div>
        )}

        <div className="mt-1.5 flex flex-wrap gap-1">
          <ActionButton label="STOP" onClick={() => onStop(med)} />

          <ActionButton
            label={med.held ? "RESUME" : "HOLD"}
            onClick={() => onHold(med)}
          />

          <ActionButton label="MODIFY" onClick={() => onEdit(med)} />

          <ActionButton label="VIEW" onClick={() => onView(med)} />
        </div>
      </div>
    </td>
  );

  return (
    <>
      <tr
        className={cn(
          "group border-t border-[#f0e8e8] hover:bg-[#fdf6f6]",
          rowBackground,
        )}
      >
      {medicationCell}

      {dateRange.dates.map((date) => (
        <td
          key={date}
          className={cn(
            "px-1 py-1 align-top hover:bg-[#fff0ea]",
            date === dateRange.todayKey && "bg-[#fdf4f0]",
          )}
        >
          <div className="flex flex-col gap-0.5">
            {times.length === 0 ? (
              <div className="flex h-8 items-center justify-center">
                <span className="text-[9px] text-[#bbbbbb]">PRN</span>
              </div>
            ) : (
              times.map((time) => (
                <DoseSlot
                  key={time}
                  medication={med}
                  date={date}
                  time={time}
                  now={now}
                  event={eventMap.get(`${med.id}|${date}T${time}`)}
                  onAdminister={onAdminister}
                  onAction={onDoseAction}
                />
              ))
            )}
          </div>
        </td>
      ))}
      </tr>

      {isExpanded && (
        <tr className="bg-[#fafafa]">
          <td colSpan={columnCount} className="px-4 py-2.5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] sm:grid-cols-3 lg:grid-cols-6">
              <DetailItem label="Dose" value={`${med.dose} ${med.unit ?? ""}`} />
              <DetailItem label="Route" value={med.route || "\u2014"} />
              <DetailItem label="Frequency" value={med.frequency || "\u2014"} />
              <DetailItem label="Schedule" value={med.schedule || "\u2014"} />
              <DetailItem
                label="Instructions"
                value={med.instructions || "\u2014"}
              />
              <DetailItem
                label="Duration"
                value={
                  med.duration
                    ? `${med.duration} ${med.durationUnit ?? ""}`
                    : "\u2014"
                }
              />
              <DetailItem
                label="Start Date"
                value={formatMedDateTime(med.startDate)}
              />
              <DetailItem
                label="End Date"
                value={formatMedDateTime(med.endDate)}
              />
              <DetailItem
                label="Prescribed By"
                value={med.prescribedBy || "\u2014"}
              />
              <DetailItem label="Status" value={med.status} />
              <DetailItem label="Quantity" value={med.quantity || "\u2014"} />
              <DetailItem label="Remarks" value={med.remarks || "\u2014"} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold tracking-wide text-[#888888] uppercase">
        {label}
      </p>

      <p
        className="truncate text-[12px] font-medium text-[#444444]"
        title={value}
      >
        {value || "\u2014"}
      </p>
    </div>
  );
}
