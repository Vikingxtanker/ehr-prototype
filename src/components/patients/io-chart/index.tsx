"use client";

import { useMemo, useState } from "react";

import { CalendarDays, Plus, Printer, Search } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useClinicalRecords } from "@/hooks/use-clinical-records";
import {
  removeIoEntry,
  type IoCategory,
  type IoEntry,
} from "@/lib/patients/clinical-store";
import {
  buildHourRows,
  summarizeEntries,
  type IoHourRow,
} from "@/lib/patients/io-chart";
import type { Patient } from "@/lib/types/patient";
import { getPatientFullName } from "@/lib/types/patient";
import { cn } from "@/lib/utils";
import { DateTimePicker, toLocalDateTimeInput } from "../vitals/datetime-picker";
import { IoDailySummaryDialog } from "./io-daily-summary";
import { IoEntryDialog } from "./io-entry-dialog";
import { IoHistoryDialog } from "./io-history-dialog";
import { IoChartTable } from "./io-chart-table";

function defaultRange() {
  const now = new Date();
  const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return {
    from: toLocalDateTimeInput(from),
    to: toLocalDateTimeInput(now),
  };
}

function SummaryBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "green" | "red" | "muted";
}) {
  return (
    <div className="flex min-w-[150px] flex-col items-center gap-0.5 border-r border-[#eeeeee] px-4 py-2 last:border-r-0">
      <span className="text-[10px] font-semibold tracking-widest text-[#888888] uppercase">
        {label}
      </span>

      <span
        className={cn(
          "text-[18px] leading-none font-bold",
          tone === "green" && "text-[#2e7d32]",
          tone === "red" && "text-[#c62828]",
          tone === "muted" && "text-[#777777]",
          !tone && "text-[#333333]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function IoChart({ patient }: { patient: Patient }) {
  const records = useClinicalRecords(patient.id);

  const defaults = useMemo(() => defaultRange(), []);
  const [fromValue, setFromValue] = useState(defaults.from);
  const [toValue, setToValue] = useState(defaults.to);
  const [appliedFrom, setAppliedFrom] = useState(defaults.from);
  const [appliedTo, setAppliedTo] = useState(defaults.to);
  const [showCumulative, setShowCumulative] = useState(false);

  const [entryOpen, setEntryOpen] = useState(false);
  const [entryNonce, setEntryNonce] = useState(0);
  const [editingEntry, setEditingEntry] = useState<IoEntry>();
  const [addFocus, setAddFocus] = useState<{
    category: IoCategory;
    row: IoHourRow;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<IoEntry | null>(null);
  const [historyEntry, setHistoryEntry] = useState<IoEntry | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const filtered = useMemo(() => {
    return records.ioEntries.filter(
      (entry) =>
        entry.recordedAt >= appliedFrom && entry.recordedAt <= appliedTo,
    );
  }, [records.ioEntries, appliedFrom, appliedTo]);

  const rows = useMemo(
    () => buildHourRows(filtered, appliedFrom, appliedTo),
    [filtered, appliedFrom, appliedTo],
  );

  const summary = useMemo(() => summarizeEntries(filtered), [filtered]);

  function handleSearch() {
    setAppliedFrom(fromValue);
    setAppliedTo(toValue);
  }

  function handleOpenEntry() {
    setAddFocus(null);
    setEditingEntry(undefined);
    setEntryNonce((nonce) => nonce + 1);
    setEntryOpen(true);
  }

  function handleAddCell(category: IoCategory, row: IoHourRow) {
    setAddFocus({ category, row });
    setEditingEntry(undefined);
    setEntryNonce((nonce) => nonce + 1);
    setEntryOpen(true);
  }

  function handleEdit(entry: IoEntry) {
    setAddFocus(null);
    setEditingEntry(entry);
    setEntryNonce((nonce) => nonce + 1);
    setEntryOpen(true);
  }

  function handleDelete(entry: IoEntry) {
    setDeleteTarget(entry);
  }

  function handleConfirmDelete() {
    if (deleteTarget) {
      removeIoEntry(patient.id, deleteTarget.id);
    }

    setDeleteTarget(null);
  }

  const entryDialogKey = `${entryNonce}-${editingEntry?.id ?? "new"}`;

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <section className="overflow-hidden rounded-[6px] border border-[#e5c5c5] bg-white">
          {/* Page header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5e5e5] bg-white px-3 py-2">
            <h1 className="text-[18px] font-semibold text-[#333333]">
              Input / Output Chart
            </h1>

            <p className="text-[11px] text-[#888888]">
              {getPatientFullName(patient)} · UHID {patient.uhid}
            </p>
          </div>

          {/* Filter toolbar */}
          <div className="sticky top-0 z-20 flex min-h-12 flex-wrap items-center gap-2 border-b border-[#e5e5e5] bg-white px-3 py-1.5">
            <DateTimePicker
              value={fromValue}
              onChange={setFromValue}
              placeholder="From date & time"
            />

            <span className="text-[11px] text-[#888888]">to</span>

            <DateTimePicker
              value={toValue}
              onChange={setToValue}
              placeholder="To date & time"
            />

            <label className="flex cursor-pointer items-center gap-1.5">
              <Checkbox
                checked={showCumulative}
                onCheckedChange={(checked) => setShowCumulative(checked === true)}
              />

              <span className="text-[11px] font-medium text-[#555555]">
                Show cumulative balance
              </span>
            </label>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSearch}
                className="h-8 text-[11px]"
              >
                <Search />

                Apply
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="h-8 text-[11px]"
              >
                <Printer />

                Print
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenEntry}
                className="h-8 text-[11px] text-[#d9534f] hover:bg-[#fdecea]"
              >
                <Plus />

                Add Entry
              </Button>

              <Button
                size="sm"
                onClick={() => setSummaryOpen(true)}
                className="h-8 bg-[#d9534f] text-white hover:bg-[#c94f4b]"
              >
                <CalendarDays />

                Daily Summary
              </Button>
            </div>
          </div>

          {/* Fluid balance summary */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#e5e5e5] bg-[#fcfcfc] px-2 py-1">
            <div className="flex flex-wrap divide-x divide-[#eeeeee]">
              <SummaryBlock label="Total Input" value={`${Math.round(summary.totalInput)} mL`} />

              <SummaryBlock
                label="Total Output"
                value={`${Math.round(summary.totalOutput)} mL`}
              />

              <SummaryBlock
                label="Fluid Balance"
                value={`${summary.balance > 0 ? "+" : ""}${Math.round(summary.balance)} mL`}
                tone={
                  summary.balance > 0
                    ? "green"
                    : summary.balance < 0
                      ? "red"
                      : "muted"
                }
              />
            </div>

            <span className="px-3 text-[10px] text-[#888888]">
              {rows.length} hour{rows.length === 1 ? "" : "s"} ·{" "}
              {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
            </span>
          </div>

          {/* Hourly grid */}
          <div className="bg-[#f5f6f8] p-3">
            <IoChartTable
              rows={rows}
              showCumulative={showCumulative}
              onAddEntry={handleAddCell}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onHistory={setHistoryEntry}
            />
          </div>
        </section>

        {/* Dialogs */}
        <IoEntryDialog
          key={entryDialogKey}
          open={entryOpen}
          onOpenChange={setEntryOpen}
          patientId={patient.id}
          initial={editingEntry}
          defaultCategory={addFocus?.category}
          defaultRecordedAt={
            addFocus ? `${addFocus.row.key}:00` : undefined
          }
        />

        <IoHistoryDialog
          entry={historyEntry}
          onOpenChange={(open) => {
            if (!open) setHistoryEntry(null);
          }}
        />

        <IoDailySummaryDialog
          open={summaryOpen}
          onOpenChange={setSummaryOpen}
          entries={filtered}
          rows={rows}
        />

        <AlertDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete I/O entry?</AlertDialogTitle>

              <AlertDialogDescription>
                This will permanently remove the entry from the chart. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction
                className="bg-[#c62828] text-white hover:bg-[#a02020]"
                onClick={handleConfirmDelete}
              >
                Delete Entry
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
