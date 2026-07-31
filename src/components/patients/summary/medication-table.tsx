"use client";

import { useState } from "react";

import { CircleStop, Pencil, Plus } from "lucide-react";

import {
  stopMedication,
  type MedStatus,
  type Medication,
  type Priority,
} from "@/lib/patients/clinical-store";
import { formatMedDateTime } from "@/lib/patients/medicine-data";
import { getCurrentUserName } from "@/lib/patients/audit";
import { useClinicalRecords } from "@/hooks/use-clinical-records";
import type { Patient } from "@/lib/types/patient";
import { cn } from "@/lib/utils";
import { AuditTooltip } from "./audit-tooltip";
import { MedicineDialog } from "./medicine-dialog";
import { SectionCard } from "./section-card";

const PRIORITY_STYLES: Record<Priority, string> = {
  STAT: "bg-[#fdecea] text-[#c62828]",
  Routine: "bg-[#e8f5e9] text-[#2e7d32]",
  Urgent: "bg-[#fff3e0] text-[#ef6c00]",
  PRN: "bg-[#ede7f6] text-[#5e35b1]",
};

const STATUS_STYLES: Record<MedStatus, string> = {
  Prescribed: "bg-[#eaf2fb] text-[#2b6cb0]",
  Dispensed: "bg-[#e0f2f1] text-[#00796b]",
  Administered: "bg-[#e8f5e9] text-[#2e7d32]",
  Completed: "bg-[#eceff1] text-[#546e7a]",
  Stopped: "bg-[#f3e5f5] text-[#8e24aa]",
};

export function MedicationTable({
  patient,
  className,
}: {
  patient: Patient;
  className?: string;
}) {
  const records = useClinicalRecords(patient.id);
  const activeMedications = records.medications.filter(
    (medication) => medication.status !== "Stopped",
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);
  const [resetKey, setResetKey] = useState(0);

  function handleOpenAdd() {
    setEditing(null);
    setResetKey((key) => key + 1);
    setOpen(true);
  }

  function handleEdit(medication: Medication) {
    setEditing(medication);
    setResetKey((key) => key + 1);
    setOpen(true);
  }

  return (
    <SectionCard
      title="Active Medications"
      className={className}
      bodyClassName="p-0"
      actions={
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex cursor-pointer items-center gap-0.5 text-[11px] font-semibold whitespace-nowrap text-[#4a90e2] hover:underline"
        >
          <Plus className="h-3 w-3" />

          Medication
        </button>
      }
    >
      {activeMedications.length === 0 ? (
        <p className="p-3 text-[12px] text-[#888888]">No active medications.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#f7f7f7] text-left text-[10px] font-semibold tracking-wide text-[#777777] uppercase">
                <th className="px-2 py-2 font-semibold">Drug</th>
                <th className="px-2 py-2 font-semibold">Priority</th>
                <th className="px-2 py-2 font-semibold">Route</th>
                <th className="px-2 py-2 font-semibold">Frequency</th>
                <th className="px-2 py-2 font-semibold">Dose</th>
                <th className="px-2 py-2 font-semibold">Schedule</th>
                <th className="px-2 py-2 font-semibold">Duration</th>
                <th className="px-2 py-2 font-semibold">Start Date</th>
                <th className="px-2 py-2 font-semibold">End Date</th>
                <th className="px-2 py-2 font-semibold">Prescribed By</th>
                <th className="px-2 py-2 font-semibold">Status</th>
                <th className="px-2 py-2 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {activeMedications.map((med, index) => (
                <tr
                  key={med.id}
                  className={cn(
                    index % 2 === 1 ? "bg-[#fafafa]" : "bg-white",
                    "transition-colors hover:bg-[#fdf3f3]",
                  )}
                >
                  <td className="px-2 py-2 font-semibold text-[#333333]">
                    <AuditTooltip audit={med}>
                      <span className="block cursor-default">{med.drug}</span>
                    </AuditTooltip>
                  </td>

                  <td className="px-2 py-2">
                    <span
                      className={cn(
                        "inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold",
                        PRIORITY_STYLES[med.priority],
                      )}
                    >
                      {med.priority}
                    </span>
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                    {med.route || "\u2014"}
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                    {med.frequency || "\u2014"}
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                    {med.dose
                      ? med.unit
                        ? `${med.dose} ${med.unit}`
                        : med.dose
                      : "\u2014"}
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                    {med.schedule || "\u2014"}
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                    {med.duration
                      ? med.durationUnit
                        ? `${med.duration} ${med.durationUnit}`
                        : med.duration
                      : "\u2014"}
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                    {formatMedDateTime(med.startDate)}
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                    {formatMedDateTime(med.endDate)}
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                    {med.prescribedBy || "\u2014"}
                  </td>

                  <td className="px-2 py-2">
                    <span
                      className={cn(
                        "inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap",
                        STATUS_STYLES[med.status],
                      )}
                    >
                      {med.status}
                    </span>
                  </td>

                  <td className="px-2 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(med)}
                        className="cursor-pointer p-0.5 text-[#777777] transition-colors hover:text-[#333333]"
                        aria-label={`Edit ${med.drug}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          stopMedication(
                            patient.id,
                            med.id,
                            getCurrentUserName(),
                          )
                        }
                        aria-label={`Stop ${med.drug}`}
                        title="Stop medication"
                        className="cursor-pointer p-0.5 text-[#e67e22] transition-colors hover:text-[#c62828]"
                      >
                        <CircleStop className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MedicineDialog
        key={resetKey}
        patient={patient}
        open={open}
        onOpenChange={setOpen}
        editing={editing}
      />
    </SectionCard>
  );
}
