"use client";

import { useState } from "react";

import { CheckCircle2, Pencil, Plus, RotateCcw, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  addComplaint,
  removeComplaint,
  toggleResolvedComplaint,
  updateComplaint,
  type Complaint,
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

export function ComplaintsCard({
  patient,
  className,
}: {
  patient: Patient;
  className?: string;
}) {
  const records = useClinicalRecords(patient.id);
  const complaints = records.complaints;

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  function openAdd() {
    setEditingId(null);
    setText("");
    setOpen(true);
  }

  function openEdit(complaint: Complaint) {
    setEditingId(complaint.id);
    setText(complaint.text);
    setOpen(true);
  }

  function handleSave() {
    const trimmed = text.trim();

    if (!trimmed) return;

    if (editingId) {
      updateComplaint(patient.id, editingId, trimmed, getCurrentUserName());
    } else {
      addComplaint(patient.id, trimmed, getCurrentUserName());
    }

    setText("");
    setEditingId(null);
    setOpen(false);
  }

  return (
    <SectionCard
      title="Active Complaints"
      className={className}
      actions={
        <button
          type="button"
          onClick={openAdd}
          className="flex cursor-pointer items-center gap-0.5 text-[11px] font-semibold whitespace-nowrap text-[#4a90e2] hover:underline"
        >
          <Plus className="h-3 w-3" />

          Complaint
        </button>
      }
    >
      {complaints.length === 0 ? (
        <p className="text-[12px] text-[#888888]">No active complaints.</p>
      ) : (
        <ul className="space-y-1.5">
          {complaints.map((complaint) => (
            <li
              key={complaint.id}
              className="group flex items-start gap-2 leading-snug"
            >
              <span
                className={cn(
                  "mt-[7px] h-1 w-1 shrink-0 rounded-full",
                  complaint.resolved ? "bg-[#cccccc]" : "bg-[#d9534f]",
                )}
              />

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <AuditTooltip audit={complaint}>
                    <span
                      className={cn(
                        "block cursor-default text-[12px]",
                        complaint.resolved
                          ? "text-[#999999] line-through"
                          : "text-[#333333]",
                      )}
                    >
                      {complaint.text}
                    </span>
                  </AuditTooltip>

                  {complaint.resolved && (
                    <span className="inline-flex rounded bg-[#e8f5e9] px-1.5 py-0.5 text-[10px] font-semibold text-[#2e7d32]">
                      Resolved
                    </span>
                  )}
                </span>

                <span className="mt-0.5 block text-[10px] text-[#999999]">
                  {complaint.resolved && complaint.resolvedAt
                    ? `Resolved on ${formatIST(complaint.resolvedAt)} IST`
                    : `Added on ${formatIST(complaint.createdAt)} IST`}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => openEdit(complaint)}
                  aria-label={`Edit ${complaint.text}`}
                  className="cursor-pointer p-0.5 text-[#cccccc] transition-colors hover:text-[#4a90e2]"
                >
                  <Pencil className="h-3 w-3" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toggleResolvedComplaint(
                      patient.id,
                      complaint.id,
                      getCurrentUserName(),
                    )
                  }
                  aria-label={
                    complaint.resolved
                      ? `Restore ${complaint.text}`
                      : `Mark resolved ${complaint.text}`
                  }
                  className="cursor-pointer p-0.5 text-[#cccccc] transition-colors hover:text-[#2e7d32]"
                >
                  {complaint.resolved ? (
                    <RotateCcw className="h-3 w-3" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => removeComplaint(patient.id, complaint.id)}
                  aria-label={`Remove ${complaint.text}`}
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
          }
        }}
        title={editingId ? "Edit Complaint" : "Add Complaint"}
        saveLabel={editingId ? "Save Changes" : "Add"}
        onSave={handleSave}
      >
        <FormField label="Complaint">
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSave();
            }}
            placeholder="e.g. Vomiting since morning"
            autoFocus
          />
        </FormField>
      </AddDialog>
    </SectionCard>
  );
}
