"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  addIoEntry,
  updateIoEntry,
  type IoCategory,
  type IoEntry,
} from "@/lib/patients/clinical-store";
import { getCurrentUserName } from "@/lib/patients/audit";
import {
  IO_CATEGORIES,
  IO_ROUTES,
  ioConfig,
} from "@/lib/patients/io-chart";
import { AddDialog, FormField } from "../summary/add-dialog";

export interface IoEntryDraft {
  category: IoCategory;
  volume: string;
  description: string;
  route: string;
  recordedAt: string;
  recordedBy: string;
  remarks: string;
}

function copyFromEntry(entry: IoEntry | undefined): IoEntryDraft {
  if (!entry) {
    return {
      category: "oral",
      volume: "",
      description: "",
      route: "Oral",
      recordedAt: "",
      recordedBy: getCurrentUserName(),
      remarks: "",
    };
  }

  return {
    category: entry.category,
    volume: entry.volume ?? "",
    description: entry.description ?? "",
    route: entry.route ?? "",
    recordedAt: entry.recordedAt ?? "",
    recordedBy: entry.recordedBy ?? getCurrentUserName(),
    remarks: entry.remarks ?? "",
  };
}

interface IoEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
  patientId: string;
  initial?: IoEntry;
  defaultCategory?: IoCategory;
  defaultRecordedAt?: string;
}

export function IoEntryDialog({
  open,
  onOpenChange,
  onSaved,
  patientId,
  initial,
  defaultCategory,
  defaultRecordedAt,
}: IoEntryDialogProps) {
  const [draft, setDraft] = useState<IoEntryDraft>(() => {
    const form = copyFromEntry(initial);

    if (!initial) {
      if (defaultCategory) form.category = defaultCategory;
      if (defaultRecordedAt) form.recordedAt = defaultRecordedAt;
      form.route = ioConfig(form.category).defaultRoute;
    }

    return form;
  });

  function setField<K extends keyof IoEntryDraft>(
    key: K,
    value: IoEntryDraft[K],
  ) {
    setDraft((current) => {
      const next = { ...current, [key]: value };

      if (key === "category" && !initial) {
        next.route = ioConfig(value as IoCategory).defaultRoute;
      }

      return next;
    });
  }

  function handleSave() {
    const values = {
      category: draft.category,
      volume: draft.volume.trim(),
      description: draft.description.trim(),
      route: draft.route.trim(),
      recordedAt: draft.recordedAt,
      recordedBy: draft.recordedBy.trim() || getCurrentUserName(),
      remarks: draft.remarks.trim(),
    };

    const actor = getCurrentUserName();

    if (initial) {
      updateIoEntry(patientId, initial.id, values, actor);
    } else {
      addIoEntry(patientId, values, actor);
    }

    onOpenChange(false);
    onSaved?.();
  }

  const [draftDate, draftTime] = (draft.recordedAt ?? "").split("T");

  const selectedConfig = ioConfig(draft.category);
  const canSave = Boolean(
    draft.category &&
      draft.recordedAt &&
      draft.recordedBy.trim() &&
      (draft.description.trim() || draft.volume.trim()),
  );

  const title = initial
    ? "Edit I/O Entry"
    : `Add ${selectedConfig.shortLabel} Entry`;

  const description = initial
    ? "Update this entry. Previous details are kept in the audit trail."
    : "Record a new input or output entry. Totals and balance are calculated automatically.";

  return (
    <AddDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      onSave={handleSave}
      saveLabel={initial ? "Save Changes" : "Save Entry"}
      className="sm:max-w-lg"
    >
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        <div className="col-span-2">
          <FormField label="Category">
            <select
              value={draft.category}
              onChange={(event) =>
                setField("category", event.target.value as IoCategory)
              }
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <optgroup label="Input">
                {IO_CATEGORIES.filter((config) => config.group === "input").map(
                  (config) => (
                    <option key={config.key} value={config.key}>
                      {config.label}
                    </option>
                  ),
                )}
              </optgroup>

              <optgroup label="Output">
                {IO_CATEGORIES.filter(
                  (config) => config.group === "output",
                ).map((config) => (
                  <option key={config.key} value={config.key}>
                    {config.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </FormField>
        </div>

        <FormField label="Volume (mL)">
          <Input
            type="number"
            min={0}
            value={draft.volume}
            onChange={(event) => setField("volume", event.target.value)}
            placeholder="e.g. 120"
          />
        </FormField>

        <FormField label="Route">
          <select
            value={draft.route}
            onChange={(event) => setField("route", event.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {IO_ROUTES.map((route) => (
              <option key={route} value={route}>
                {route}
              </option>
            ))}
          </select>
        </FormField>

        <div className="col-span-2">
          <FormField label="Description">
            <Input
              value={draft.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder={selectedConfig.placeholder}
            />
          </FormField>
        </div>

        <FormField label="Date">
          <Input
            type="date"
            value={draftDate ?? ""}
            onChange={(event) =>
              setField(
                "recordedAt",
                event.target.value
                  ? `${event.target.value}T${draftTime ?? "00:00"}`
                  : "",
              )
            }
          />
        </FormField>

        <FormField label="Time">
          <Input
            type="time"
            value={draftTime ?? ""}
            onChange={(event) =>
              setField(
                "recordedAt",
                draftDate
                  ? `${draftDate}T${event.target.value || "00:00"}`
                  : event.target.value,
              )
            }
          />
        </FormField>

        <FormField label="Recorded By">
          <Input
            value={draft.recordedBy}
            onChange={(event) => setField("recordedBy", event.target.value)}
            placeholder="Nurse name"
          />
        </FormField>

        <div className="col-span-2">
          <FormField label="Remarks">
            <Textarea
              value={draft.remarks}
              onChange={(event) => setField("remarks", event.target.value)}
              placeholder="Optional notes for this entry"
              className="min-h-[64px]"
            />
          </FormField>
        </div>
      </div>

      {!canSave && (
        <p className="text-[10px] text-[#a94442]">
          Category, date/time, recorded by and a volume or description are
          required.
        </p>
      )}
    </AddDialog>
  );
}
