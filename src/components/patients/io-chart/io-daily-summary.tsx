"use client";

import { useMemo } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { IoEntry } from "@/lib/patients/clinical-store";
import {
  IO_CATEGORIES,
  type IoHourRow,
  formatBalance,
  summarizeEntries,
  totalInputVolume,
  totalOutputVolume,
  totalVolumeByCategory,
} from "@/lib/patients/io-chart";
import { cn } from "@/lib/utils";

function SummaryItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "green" | "red" | "muted";
}) {
  return (
    <div className="rounded-[4px] border border-[#eeeeee] bg-[#fcfcfc] px-2.5 py-2">
      <p className="text-[10px] font-semibold tracking-wide text-[#888888] uppercase">
        {label}
      </p>

      <p
        className={cn(
          "mt-0.5 text-[15px] font-bold",
          tone === "green" && "text-[#2e7d32]",
          tone === "red" && "text-[#c62828]",
          tone === "muted" && "text-[#777777]",
          !tone && "text-[#333333]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function BalanceBars({
  label,
  leftValue,
  rightValue,
  leftLabel,
  rightLabel,
  leftColor,
  rightColor,
}: {
  label: string;
  leftValue: number;
  rightValue: number;
  leftLabel: string;
  rightLabel: string;
  leftColor: string;
  rightColor: string;
}) {
  const max = Math.max(leftValue, rightValue, 1);
  const leftHeight = Math.max(4, (leftValue / max) * 100);
  const rightHeight = Math.max(4, (rightValue / max) * 100);

  return (
    <div className="rounded-[6px] border border-[#eeeeee] bg-white p-3">
      <p className="mb-3 text-[10px] font-semibold tracking-wide text-[#888888] uppercase">
        {label}
      </p>

      <div className="flex items-end justify-center gap-8">
        <div className="flex w-20 flex-col items-center">
          <span className="text-[12px] font-bold text-[#333333]">
            {Math.round(leftValue)}
          </span>

          <div className="mt-1 flex h-32 w-10 items-end overflow-hidden rounded-t-[4px] bg-[#f0f0f0]">
            <div
              className={cn("w-full rounded-t-[4px]", leftColor)}
              style={{ height: `${leftHeight}%` }}
            />
          </div>

          <span className="mt-1 text-[10px] font-semibold text-[#555555] uppercase">
            {leftLabel}
          </span>
        </div>

        <div className="flex w-20 flex-col items-center">
          <span className="text-[12px] font-bold text-[#333333]">
            {Math.round(rightValue)}
          </span>

          <div className="mt-1 flex h-32 w-10 items-end overflow-hidden rounded-t-[4px] bg-[#f0f0f0]">
            <div
              className={cn("w-full rounded-t-[4px]", rightColor)}
              style={{ height: `${rightHeight}%` }}
            />
          </div>

          <span className="mt-1 text-[10px] font-semibold text-[#555555] uppercase">
            {rightLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function HourlyBalanceChart({ rows }: { rows: IoHourRow[] }) {
  const maxAbs = Math.max(...rows.map((row) => Math.abs(row.balance)), 1);

  return (
    <div className="rounded-[6px] border border-[#eeeeee] bg-white p-3">
      <p className="mb-3 text-[10px] font-semibold tracking-wide text-[#888888] uppercase">
        Hourly Fluid Balance
      </p>

      <div className="overflow-x-auto">
        <div className="flex h-36 min-w-max items-end gap-1">
          {rows.map((row) => {
            const positive = row.balance >= 0;
            const height = Math.max(3, (Math.abs(row.balance) / maxAbs) * 100);

            return (
              <div
                key={row.key}
                className="flex w-7 flex-col items-center"
                title={`${row.time} · ${formatBalance(row.balance)} mL`}
              >
                <div className="flex h-28 w-full items-end justify-center">
                  <div
                    className={cn(
                      "w-full rounded-t-[2px]",
                      positive ? "bg-[#81c784]" : "bg-[#e57373]",
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>

                <span className="mt-1 text-[9px] text-[#777777]">
                  {row.time.slice(0, 5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function IoDailySummaryDialog({
  open,
  onOpenChange,
  entries,
  rows,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: IoEntry[];
  rows: IoHourRow[];
}) {
  const summary = useMemo(() => summarizeEntries(entries), [entries]);

  const categoryTotals = useMemo(() => {
    const totals: Array<{
      key: string;
      label: string;
      value: number;
      input: boolean;
    }> = IO_CATEGORIES.map((config) => ({
      key: config.key,
      label: config.shortLabel,
      value: totalVolumeByCategory(entries, config.key),
      input: config.group === "input",
    }));

    return totals;
  }, [entries]);

  const totalInput = totalInputVolume(entries);
  const totalOutput = totalOutputVolume(entries);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daily Summary</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryItem
              label="Total Input"
              value={`${Math.round(summary.totalInput)} mL`}
            />
            <SummaryItem
              label="Total Output"
              value={`${Math.round(summary.totalOutput)} mL`}
            />
            <SummaryItem
              label="Net Fluid Balance"
              value={`${formatBalance(summary.balance)} mL`}
              tone={summary.balance > 0 ? "green" : summary.balance < 0 ? "red" : "muted"}
            />
            <SummaryItem
              label="Period Hours"
              value={`${rows.length} h`}
              tone="muted"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {categoryTotals.map((item) => (
              <SummaryItem
                key={item.key}
                label={item.label}
                value={
                  item.value > 0 ? `${Math.round(item.value)} mL` : "\u2014"
                }
              />
            ))}
          </div>

          <BalanceBars
            label="Total Intake vs Output"
            leftValue={totalInput}
            rightValue={totalOutput}
            leftLabel="Input"
            rightLabel="Output"
            leftColor="bg-[#81c784]"
            rightColor="bg-[#e57373]"
          />

          {rows.length > 0 && <HourlyBalanceChart rows={rows} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
