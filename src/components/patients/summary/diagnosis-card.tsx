"use client";

import { useState } from "react";

import { Plus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  addDiagnosis,
  removeDiagnosis,
} from "@/lib/patients/clinical-store";
import {
  formatIST,
  getCurrentUserName,
} from "@/lib/patients/audit";
import { useClinicalRecords } from "@/hooks/use-clinical-records";
import type { Patient } from "@/lib/types/patient";
import { cn } from "@/lib/utils";
import { AddDialog, FormField } from "./add-dialog";
import { AuditTooltip } from "./audit-tooltip";
import { SectionCard } from "./section-card";

export function DiagnosisCard({
  patient,
  className,
}: {
  patient: Patient;
  className?: string;
}) {
  const records = useClinicalRecords(patient.id);
  const diagnoses = records.diagnoses;

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [icdCode, setIcdCode] = useState("");

  function handleSave() {
    const trimmed = text.trim();

    if (!trimmed) return;

    addDiagnosis(patient.id, trimmed, icdCode, getCurrentUserName());

    setText("");
    setIcdCode("");
    setOpen(false);
  }

  return (
    <SectionCard
      title="Encounter Diagnosis"
      className={className}
      actions={
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex cursor-pointer items-center gap-0.5 text-[11px] font-semibold whitespace-nowrap text-[#4a90e2] hover:underline"
        >
          <Plus className="h-3 w-3" />

          Add Diagnosis
        </button>
      }
    >
      {diagnoses.length === 0 ? (
        <p className="text-[12px] text-[#888888]">No diagnosis available.</p>
      ) : (
        <ul className="space-y-1.5">
          {diagnoses.map((diagnosis) => (
            <li
              key={diagnosis.id}
              className="group flex items-start gap-2 text-[12px] leading-snug text-[#333333]"
            >
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#2e7d32]" />

              <span className="min-w-0 flex-1">
                <AuditTooltip audit={diagnosis}>
                  <span className="block cursor-default">
                    {diagnosis.text}

                    {diagnosis.icdCode && (
                      <span
                        className={cn(
                          "ml-1.5 inline-flex rounded px-1 py-0.5 align-middle",
                          "bg-[#f5f5f5] text-[10px] font-semibold text-[#777777]",
                        )}
                      >
                        ICD-{diagnosis.icdCode}
                      </span>
                    )}
                  </span>
                </AuditTooltip>

                <span className="mt-0.5 block text-[10px] text-[#999999]">
                  Added on {formatIST(diagnosis.createdAt)} IST
                </span>
              </span>

              <button
                type="button"
                onClick={() => removeDiagnosis(patient.id, diagnosis.id)}
                aria-label={`Remove ${diagnosis.text}`}
                className="cursor-pointer p-0.5 text-[#cccccc] opacity-0 transition-opacity hover:text-[#c62828] group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AddDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Diagnosis"
        onSave={handleSave}
      >
        <FormField label="Diagnosis">
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSave();
            }}
            placeholder="e.g. Acute Gastroenteritis"
            autoFocus
          />
        </FormField>

        <FormField label="ICD Code (optional)">
          <Input
            value={icdCode}
            onChange={(event) => setIcdCode(event.target.value)}
            placeholder="e.g. A09"
          />
        </FormField>
      </AddDialog>
    </SectionCard>
  );
}
