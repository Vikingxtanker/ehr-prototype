"use client";

import { useState } from "react";

import { CheckCircle2, Pencil, Plus, RotateCcw, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  addDiagnosis,
  removeDiagnosis,
  toggleResolvedDiagnosis,
  updateDiagnosis,
  type Diagnosis,
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
  const [editingId, setEditingId] = useState<string | null>(null);

  function openAdd() {
    setEditingId(null);
    setText("");
    setIcdCode("");
    setOpen(true);
  }

  function openEdit(diagnosis: Diagnosis) {
    setEditingId(diagnosis.id);
    setText(diagnosis.text);
    setIcdCode(diagnosis.icdCode ?? "");
    setOpen(true);
  }

  function handleSave() {
    const trimmed = text.trim();

    if (!trimmed) return;

    if (editingId) {
      updateDiagnosis(
        patient.id,
        editingId,
        trimmed,
        icdCode,
        getCurrentUserName(),
      );
    } else {
      addDiagnosis(patient.id, trimmed, icdCode, getCurrentUserName());
    }

    setText("");
    setIcdCode("");
    setEditingId(null);
    setOpen(false);
  }

  return (
    <SectionCard
      title="Encounter Diagnosis"
      className={className}
      actions={
        <button
          type="button"
          onClick={openAdd}
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
              className="group flex items-start gap-2 text-[12px] leading-snug"
            >
              <span
                className={cn(
                  "mt-[7px] h-1 w-1 shrink-0 rounded-full",
                  diagnosis.resolved ? "bg-[#cccccc]" : "bg-[#2e7d32]",
                )}
              />

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <AuditTooltip audit={diagnosis}>
                    <span
                      className={cn(
                        "block cursor-default",
                        diagnosis.resolved
                          ? "text-[#999999] line-through"
                          : "text-[#333333]",
                      )}
                    >
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

                  {diagnosis.resolved && (
                    <span className="inline-flex rounded bg-[#e8f5e9] px-1.5 py-0.5 text-[10px] font-semibold text-[#2e7d32]">
                      Resolved
                    </span>
                  )}
                </span>

                <span className="mt-0.5 block text-[10px] text-[#999999]">
                  {diagnosis.resolved && diagnosis.resolvedAt
                    ? `Resolved on ${formatIST(diagnosis.resolvedAt)} IST`
                    : `Added on ${formatIST(diagnosis.createdAt)} IST`}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => openEdit(diagnosis)}
                  aria-label={`Edit ${diagnosis.text}`}
                  className="cursor-pointer p-0.5 text-[#cccccc] transition-colors hover:text-[#4a90e2]"
                >
                  <Pencil className="h-3 w-3" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toggleResolvedDiagnosis(
                      patient.id,
                      diagnosis.id,
                      getCurrentUserName(),
                    )
                  }
                  aria-label={
                    diagnosis.resolved
                      ? `Restore ${diagnosis.text}`
                      : `Mark resolved ${diagnosis.text}`
                  }
                  className="cursor-pointer p-0.5 text-[#cccccc] transition-colors hover:text-[#2e7d32]"
                >
                  {diagnosis.resolved ? (
                    <RotateCcw className="h-3 w-3" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => removeDiagnosis(patient.id, diagnosis.id)}
                  aria-label={`Remove ${diagnosis.text}`}
                  className="cursor-pointer p-0.5 text-[#cccccc] transition-colors hover:text-[#c62828]"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <AddDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);

          if (!next) {
            setEditingId(null);
            setText("");
            setIcdCode("");
          }
        }}
        title={editingId ? "Edit Diagnosis" : "Add Diagnosis"}
        saveLabel={editingId ? "Save Changes" : "Add"}
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
