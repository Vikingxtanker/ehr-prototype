"use client";

import { useState } from "react";

import { Plus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  addComplaint,
  removeComplaint,
} from "@/lib/patients/clinical-store";
import {
  formatIST,
  getCurrentUserName,
} from "@/lib/patients/audit";
import { useClinicalRecords } from "@/hooks/use-clinical-records";
import type { Patient } from "@/lib/types/patient";
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

  function handleSave() {
    const trimmed = text.trim();

    if (!trimmed) return;

    addComplaint(patient.id, trimmed, getCurrentUserName());

    setText("");
    setOpen(false);
  }

  return (
    <SectionCard
      title="Active Complaints"
      className={className}
      actions={
        <button
          type="button"
          onClick={() => setOpen(true)}
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
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#d9534f]" />

              <span className="min-w-0 flex-1">
                <AuditTooltip audit={complaint}>
                  <span className="block cursor-default text-[12px] text-[#333333]">
                    {complaint.text}
                  </span>
                </AuditTooltip>

                <span className="mt-0.5 block text-[10px] text-[#999999]">
                  Added on {formatIST(complaint.createdAt)} IST
                </span>
              </span>

              <button
                type="button"
                onClick={() => removeComplaint(patient.id, complaint.id)}
                aria-label={`Remove ${complaint.text}`}
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
        title="Add Complaint"
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
