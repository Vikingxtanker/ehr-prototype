"use client";

import { RotateCcw, Trash2 } from "lucide-react";

import {
  removeMedication,
  resumeMedication,
} from "@/lib/patients/clinical-store";
import { formatIST, getCurrentUserName } from "@/lib/patients/audit";
import { useClinicalRecords } from "@/hooks/use-clinical-records";
import type { Patient } from "@/lib/types/patient";
import { AuditTooltip } from "./audit-tooltip";
import { SectionCard } from "./section-card";

export function StoppedMedicationsCard({
  patient,
  className,
}: {
  patient: Patient;
  className?: string;
}) {
  const records = useClinicalRecords(patient.id);
  const stopped = records.medications.filter(
    (medication) => medication.status === "Stopped",
  );

  return (
    <SectionCard
      title="Stopped Medications"
      className={className}
      bodyClassName="p-0"
    >
      {stopped.length === 0 ? (
        <p className="p-3 text-[12px] text-[#888888]">
          No stopped medications.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#f7f7f7] text-left text-[10px] font-semibold tracking-wide text-[#777777] uppercase">
                <th className="px-2 py-2 font-semibold">Drug</th>
                <th className="px-2 py-2 font-semibold">Dose</th>
                <th className="px-2 py-2 font-semibold">Schedule</th>
                <th className="px-2 py-2 font-semibold">Stopped By</th>
                <th className="px-2 py-2 font-semibold">Stopped On</th>
                <th className="px-2 py-2 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {stopped.map((med, index) => (
                <tr
                  key={med.id}
                  className={
                    index % 2 === 1 ? "bg-[#fafafa]" : "bg-white"
                  }
                >
                  <td className="px-2 py-2 font-semibold text-[#333333]">
                    <AuditTooltip audit={med}>
                      <span className="block cursor-default">{med.drug}</span>
                    </AuditTooltip>
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
                    {med.stoppedBy || "\u2014"}
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap text-[#555555]">
                    {med.stoppedAt ? formatIST(med.stoppedAt) : "\u2014"}
                  </td>

                  <td className="px-2 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          resumeMedication(
                            patient.id,
                            med.id,
                            getCurrentUserName(),
                          )
                        }
                        aria-label={`Resume ${med.drug}`}
                        title="Resume medication"
                        className="cursor-pointer p-0.5 text-[#4a90e2] transition-colors hover:text-[#2b6cb0]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeMedication(patient.id, med.id)}
                        aria-label={`Remove ${med.drug}`}
                        title="Delete permanently"
                        className="cursor-pointer p-0.5 text-[#c62828] transition-colors hover:text-[#333333]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
