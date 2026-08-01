"use client";

import { useMemo, useState } from "react";

import { Plus, Printer, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useClinicalRecords } from "@/hooks/use-clinical-records";
import type { Patient } from "@/lib/types/patient";
import type {
  VitalFieldKey,
  VitalReading,
} from "@/lib/patients/clinical-store";
import { DateTimePicker, toLocalDateTimeInput } from "./datetime-picker";
import {
  TrendDialog,
  type TrendPoint,
} from "./trend-chart";
import {
  VitalsChartingTable,
  type ChartRow,
} from "./vitals-charting-table";
import { VitalsEntryDialog } from "./vitals-entry-dialog";

function defaultRange() {
  const now = new Date();
  const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    from: toLocalDateTimeInput(from),
    to: toLocalDateTimeInput(now),
  };
}

export function VitalsCharting({ patient }: { patient: Patient }) {
  const records = useClinicalRecords(patient.id);

  const defaults = useMemo(() => defaultRange(), []);
  const [fromValue, setFromValue] = useState(defaults.from);
  const [toValue, setToValue] = useState(defaults.to);
  const [appliedFrom, setAppliedFrom] = useState(defaults.from);
  const [appliedTo, setAppliedTo] = useState(defaults.to);
  const [selectedReadingId, setSelectedReadingId] = useState<string | null>(
    records.vitals[0]?.id ?? null,
  );

  const [entryOpen, setEntryOpen] = useState(false);
  const [entryNonce, setEntryNonce] = useState(0);
  const [editingReading, setEditingReading] = useState<VitalReading>();
  const [addFocus, setAddFocus] = useState<{
    keys: VitalFieldKey[];
    label: string;
  } | null>(null);
  const [trendRow, setTrendRow] = useState<ChartRow>();
  const [trendOpen, setTrendOpen] = useState(false);

  const filtered = useMemo(() => {
    const fromMs = appliedFrom ? new Date(appliedFrom).getTime() : -Infinity;
    const toMs = appliedTo ? new Date(appliedTo).getTime() : Infinity;

    return records.vitals.filter((reading) => {
      const time = new Date(reading.createdAt).getTime();

      return time >= fromMs && time <= toMs;
    });
  }, [records.vitals, appliedFrom, appliedTo]);

  function handleSearch() {
    setAppliedFrom(fromValue);
    setAppliedTo(toValue);
  }

  function handleClear() {
    setFromValue(defaults.from);
    setToValue(defaults.to);
    setAppliedFrom(defaults.from);
    setAppliedTo(defaults.to);
  }

  function handleOpenEntry() {
    setAddFocus(null);
    setEditingReading(undefined);
    setEntryNonce((nonce) => nonce + 1);
    setEntryOpen(true);
  }

  function handleEditParameter(
    keys: VitalFieldKey[],
    label: string,
    source: VitalReading,
  ) {
    setAddFocus({ keys, label });
    setEditingReading(source);
    setEntryNonce((nonce) => nonce + 1);
    setEntryOpen(true);
  }

  function handleAddReading(keys: VitalFieldKey[], label: string) {
    setAddFocus({ keys, label });
    setEditingReading(undefined);
    setEntryNonce((nonce) => nonce + 1);
    setEntryOpen(true);
  }

  function handleOpenTrend(row: ChartRow) {
    setTrendRow(row);
    setTrendOpen(true);
  }

  function handleSaved(id: string) {
    setSelectedReadingId(id);
  }

  return (
    <TooltipProvider>
      <div className="overflow-hidden rounded-[6px] border border-[#e5c5c5] bg-white">
        {/* Page header */}
        <div className="border-b border-[#e5e5e5] bg-white px-3 py-2">
          <h1 className="text-[18px] font-semibold text-[#333333]">
            Vitals Charting
          </h1>
        </div>

        {/* Filter toolbar */}
        <div className="flex h-12 flex-wrap items-center gap-2 border-b border-[#e5e5e5] bg-white px-3">
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

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearch}
              className="h-9 text-[11px]"
            >
              <Search />

              Search
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="h-9 text-[11px]"
            >
              <RotateCcw />

              Clear
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-9 text-[11px]"
            >
              <Printer />

              Print
            </Button>

            <Button
              size="sm"
              onClick={handleOpenEntry}
              className="h-9 bg-[#d9534f] text-white hover:bg-[#c94f4b]"
            >
              <Plus />

              Latest Vitals
            </Button>
          </div>
        </div>

        {/* Comparison table */}
        <div className="p-3">
          <VitalsChartingTable
            readings={filtered}
            selectedReadingId={selectedReadingId}
            onSelectReading={setSelectedReadingId}
            onOpenTrend={handleOpenTrend}
            onEditParameter={handleEditParameter}
            onAddReading={handleAddReading}
          />
        </div>
      </div>

      <VitalsEntryDialog
        key={entryNonce}
        open={entryOpen}
        onOpenChange={setEntryOpen}
        onSaved={handleSaved}
        patientId={patient.id}
        initial={editingReading}
        focusKeys={addFocus?.keys}
        focusLabel={addFocus?.label}
      />

      <TrendDialog
        open={trendOpen}
        onOpenChange={setTrendOpen}
        title={trendRow?.label ?? ""}
        reference={trendRow?.reference}
        points={
          trendRow
            ? filtered
                .map((reading) => ({
                  label: reading.createdAt,
                  value: trendRow.trend(reading),
                }))
                .filter(
                  (point): point is TrendPoint & { value: number } =>
                    point.value !== null,
                )
            : []
        }
      />
    </TooltipProvider>
  );
}
