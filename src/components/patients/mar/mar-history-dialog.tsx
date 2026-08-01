"use client";

import { X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import type {
  MARAdministrationStatus,
  Medication,
  MedicationAdministration,
} from "@/lib/patients/clinical-store";
import { formatIST } from "@/lib/patients/audit";
import { formatMedDateTime } from "@/lib/patients/medicine-data";
import { getDoseState, nowLocalDateTime } from "@/lib/patients/mar";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<MARAdministrationStatus, string> = {
  Administered: "bg-[#e8f5e9] text-[#2e7d32]",
  Scheduled: "bg-[#eceff1] text-[#607d8b]",
  Missed: "bg-[#fdecea] text-[#c62828]",
  Delayed: "bg-[#fff3e0] text-[#ef6c00]",
  Held: "bg-[#f5f5f5] text-[#757575]",
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold tracking-wide text-[#888888] uppercase">
        {label}
      </p>

      <p className="truncate text-[12px] font-semibold text-[#444444]" title={value}>
        {value || "\u2014"}
      </p>
    </div>
  );
}

function AdminStatusBadge({
  status,
  scheduledAt,
  medication,
}: {
  status: MARAdministrationStatus;
  scheduledAt: string;
  medication?: Medication | null;
}) {
  const label =
    status === "Scheduled" && medication
      ? (() => {
          const state = getDoseState(medication, scheduledAt, nowLocalDateTime());

          if (state.key === "due") return "Due";
          if (state.key === "missed") return "Missed";
          return status;
        })()
      : status;

  return (
    <span
      className={cn(
        "inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap",
        STATUS_STYLES[status],
        label === "Due" && "bg-[#e3f2fd] text-[#1565c0]",
      )}
    >
      {label}
    </span>
  );
}

export function MedicationHistoryDialog({
  open,
  onOpenChange,
  medication,
  administrations,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication | null;
  administrations: MedicationAdministration[];
}) {
  const history = medication
    ? administrations
        .filter((item) => item.medicationId === medication.id)
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-[8px] border border-[#e5bcbc] p-0 shadow-2xl ring-0 sm:max-w-3xl">
        <div className="flex items-center justify-between border-b border-[#e5bcbc] px-5 py-4">
          <div>
            <DialogTitle className="text-lg font-semibold text-[#333333]">
              Prescription & Administration History
            </DialogTitle>

            <p className="mt-0.5 text-[11px] text-[#777777]">
              {medication?.drug ?? "\u2014"}
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

        <div className="max-h-[calc(100vh-280px)] overflow-y-auto px-5 py-4">
          {medication && (
            <div className="mb-4 rounded-[6px] border border-[#e7bcbc] bg-[#fff5f5] p-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                <Detail
                  label="Strength"
                  value={medication.strength ?? "\u2014"}
                />
                <Detail label="Dose" value={`${medication.dose} ${medication.unit ?? ""}`} />
                <Detail label="Route" value={medication.route} />
                <Detail label="Frequency" value={medication.frequency} />
                <Detail label="Schedule" value={medication.schedule || "\u2014"} />
                <Detail label="Start Date" value={formatMedDateTime(medication.startDate)} />
                <Detail label="End Date" value={formatMedDateTime(medication.endDate)} />
                <Detail label="Instructions" value={medication.instructions ?? "\u2014"} />
                <Detail
                  label="Duration"
                  value={
                    medication.duration
                      ? `${medication.duration} ${medication.durationUnit ?? ""}`
                      : "\u2014"
                  }
                />
                <Detail label="Prescribed By" value={medication.prescribedBy} />
                <Detail label="Status" value={medication.status} />
              </div>
            </div>
          )}

          {history.length === 0 ? (
            <p className="py-8 text-center text-[12px] text-[#888888]">
              No administration events recorded for this medication yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[6px] border border-[#eeeeee]">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-[#f7f7f7] text-left text-[10px] font-semibold tracking-wide text-[#777777] uppercase">
                    <th className="px-2 py-2 font-semibold">Scheduled</th>
                    <th className="px-2 py-2 font-semibold">Status</th>
                    <th className="px-2 py-2 font-semibold">Given At</th>
                    <th className="px-2 py-2 font-semibold">Dose</th>
                    <th className="px-2 py-2 font-semibold">Route</th>
                    <th className="px-2 py-2 font-semibold">Given By</th>
                    <th className="px-2 py-2 font-semibold">Batch</th>
                    <th className="px-2 py-2 font-semibold">Site</th>
                    <th className="px-2 py-2 font-semibold">Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-[#eeeeee] hover:bg-[#fdf3f3]"
                    >
                      <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                        {formatMedDateTime(item.scheduledAt)}
                      </td>

                      <td className="px-2 py-2">
                        <AdminStatusBadge
                          status={item.status}
                          scheduledAt={item.scheduledAt}
                          medication={medication}
                        />
                      </td>

                      <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                        {item.givenAt ? formatMedDateTime(item.givenAt) : "\u2014"}
                      </td>

                      <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                        {item.dose ?? "\u2014"}
                      </td>

                      <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                        {item.route ?? "\u2014"}
                      </td>

                      <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                        {item.administeredBy ?? "\u2014"}
                      </td>

                      <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                        {item.batchNumber ?? "\u2014"}
                      </td>

                      <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                        {item.site ?? "\u2014"}
                      </td>

                      <td className="max-w-[180px] truncate px-2 py-2 text-[#555555]">
                        {item.reason ?? "\u2014"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AllAdministrationsDialog({
  open,
  onOpenChange,
  administrations,
  medications,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  administrations: MedicationAdministration[];
  medications: Medication[];
}) {
  const drugById = new Map(medications.map((med) => [med.id, med.drug]));

  const sorted = [...administrations].sort((a, b) =>
    b.scheduledAt.localeCompare(a.scheduledAt),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-[8px] border border-[#e5bcbc] p-0 shadow-2xl ring-0 sm:max-w-3xl">
        <div className="flex items-center justify-between border-b border-[#e5bcbc] px-5 py-4">
          <div>
            <DialogTitle className="text-lg font-semibold text-[#333333]">
              Medication Administration History
            </DialogTitle>

            <p className="mt-0.5 text-[11px] text-[#777777]">
              All recorded administration events for this patient.
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

        <div className="max-h-[calc(100vh-280px)] overflow-y-auto px-5 py-4">
          {sorted.length === 0 ? (
            <p className="py-8 text-center text-[12px] text-[#888888]">
              No administration events have been recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-[6px] border border-[#eeeeee]">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-[#f7f7f7] text-left text-[10px] font-semibold tracking-wide text-[#777777] uppercase">
                    <th className="px-2 py-2 font-semibold">Medication</th>
                    <th className="px-2 py-2 font-semibold">Scheduled</th>
                    <th className="px-2 py-2 font-semibold">Status</th>
                    <th className="px-2 py-2 font-semibold">Given At</th>
                    <th className="px-2 py-2 font-semibold">Dose</th>
                    <th className="px-2 py-2 font-semibold">Given By</th>
                    <th className="px-2 py-2 font-semibold">Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {sorted.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-[#eeeeee] hover:bg-[#fdf3f3]"
                    >
                      <td className="px-2 py-2 font-semibold text-[#333333]">
                        {drugById.get(item.medicationId) ?? "\u2014"}
                      </td>

                      <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                        {formatMedDateTime(item.scheduledAt)}
                      </td>

                      <td className="px-2 py-2">
                        <span
                          className={cn(
                            "inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap",
                            STATUS_STYLES[item.status],
                          )}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                        {item.givenAt
                          ? formatIST(item.givenAt)
                          : "\u2014"}
                      </td>

                      <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                        {item.dose ?? "\u2014"}
                      </td>

                      <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                        {item.administeredBy ?? "\u2014"}
                      </td>

                      <td className="max-w-[200px] truncate px-2 py-2 text-[#555555]">
                        {item.reason ?? "\u2014"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
