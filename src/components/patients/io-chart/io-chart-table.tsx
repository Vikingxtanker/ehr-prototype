"use client";

import { History, Pencil, Plus, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatIST } from "@/lib/patients/audit";
import type { IoCategory, IoEntry } from "@/lib/patients/clinical-store";
import {
  INPUT_CATEGORIES,
  OUTPUT_CATEGORIES,
  formatBalance,
  formatEntryVolume,
  formatTimeLabel,
  ioConfig,
  type IoHourRow,
} from "@/lib/patients/io-chart";
import { cn } from "@/lib/utils";

const DATE_WIDTH = 100;
const TIME_WIDTH = 54;

const INPUT_HEADER = "#666666";
const OUTPUT_HEADER = "#c94a4a";

function EntryChip({
  entry,
  onEdit,
  onDelete,
  onHistory,
}: {
  entry: IoEntry;
  onEdit: (entry: IoEntry) => void;
  onDelete: (entry: IoEntry) => void;
  onHistory: (entry: IoEntry) => void;
}) {
  const config = ioConfig(entry.category);
  const volume = formatEntryVolume(entry);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger
            aria-label={`${config.shortLabel} entry for ${entry.recordedAt}`}
            className="flex w-full cursor-pointer flex-col items-start gap-px rounded-[3px] border border-[#e3e3e3] bg-white px-1.5 py-1 text-left transition-colors hover:border-[#d9534f] hover:bg-[#fdf6f6]"
          >
            <span className="flex w-full items-baseline gap-1 leading-tight">
              {volume && (
                <span className="text-[11px] font-bold text-[#2b2b2b]">
                  {volume}
                </span>
              )}

              <span className="min-w-0 flex-1 truncate text-[10px] text-[#555555]">
                {entry.description}
              </span>
            </span>

            {entry.route && (
              <span className="text-[9px] text-[#888888]">
                ({entry.route})
              </span>
            )}

            <span className="text-[9px] text-[#999999]">
              Nurse: {entry.recordedBy}
            </span>
          </DropdownMenuTrigger>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          align="center"
          className="max-w-xs flex-col items-start gap-1"
        >
          <span className="text-[11px] font-semibold text-white">
            {config.label} · {volume || "No volume"}
          </span>

          <span className="text-[11px] text-white/80">
            Recorded by {entry.recordedBy || "Unknown"} on{" "}
            {formatTimeLabel(entry.recordedAt)}
          </span>

          {entry.remarks && (
            <span className="text-[11px] text-white/80">
              Remarks: {entry.remarks}
            </span>
          )}

          {entry.updatedAt && entry.updatedBy ? (
            <span className="text-[11px] text-amber-300">
              Last modified by {entry.updatedBy} on {formatIST(entry.updatedAt)}
            </span>
          ) : (
            <span className="text-[11px] text-white/60">
              Created by {entry.createdBy || "Unknown"} on{" "}
              {formatIST(entry.createdAt)}
            </span>
          )}
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="start" className="min-w-40">
        <DropdownMenuItem onClick={() => onEdit(entry)}>
          <Pencil />

          Edit
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onHistory(entry)}>
          <History />

          View History
        </DropdownMenuItem>

        <DropdownMenuItem variant="destructive" onClick={() => onDelete(entry)}>
          <Trash2 />

          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EntryCell({
  category,
  row,
  onAddEntry,
  onEdit,
  onDelete,
  onHistory,
}: {
  category: IoCategory;
  row: IoHourRow;
  onAddEntry: (category: IoCategory, row: IoHourRow) => void;
  onEdit: (entry: IoEntry) => void;
  onDelete: (entry: IoEntry) => void;
  onHistory: (entry: IoEntry) => void;
}) {
  const config = ioConfig(category);
  const entries = row.byCategory[category] ?? [];

  return (
    <td className="px-1 py-1 align-top">
      <div className="flex min-h-[52px] flex-col gap-0.5">
        {entries.map((entry) => (
          <EntryChip
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
            onHistory={onHistory}
          />
        ))}

        <button
          type="button"
          onClick={() => onAddEntry(category, row)}
          title={`Add ${config.label}`}
          aria-label={`Add ${config.label}`}
          className={cn(
            "group/add flex h-4 cursor-pointer items-center justify-center rounded text-[#bbbbbb] transition-colors hover:bg-[#fdecea] hover:text-[#d9534f]",
            entries.length === 0 && "flex-1 min-h-[28px] text-[#d9d9d9]",
          )}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </td>
  );
}

function BalanceCell({
  value,
  cumulative,
}: {
  value: number;
  cumulative?: boolean;
}) {
  const tone =
    value > 0
      ? "text-[#2e7d32]"
      : value < 0
        ? "text-[#c62828]"
        : "text-[#999999]";

  return (
    <td
      className={cn(
        "px-1.5 py-1 text-center align-middle font-bold",
        tone,
      )}
    >
      {formatBalance(value)}
      {cumulative && <span className="block text-[8px] font-normal">cum.</span>}
    </td>
  );
}

export function IoChartTable({
  rows,
  showCumulative,
  onAddEntry,
  onEdit,
  onDelete,
  onHistory,
}: {
  rows: IoHourRow[];
  showCumulative: boolean;
  onAddEntry: (category: IoCategory, row: IoHourRow) => void;
  onEdit: (entry: IoEntry) => void;
  onDelete: (entry: IoEntry) => void;
  onHistory: (entry: IoEntry) => void;
}) {
  const columnCount =
    2 +
    INPUT_CATEGORIES.length +
    1 +
    OUTPUT_CATEGORIES.length +
    1 +
    1;

  let cumulative = 0;

  const orderedRows = [...rows].reverse();

  return (
    <div className="rounded-[6px] border border-[#e5c5c5] bg-white">
      <div className="max-h-[calc(100dvh-360px)] overflow-auto">
        <table className="w-full table-fixed border-collapse text-[11px]">
          <colgroup>
            <col style={{ width: DATE_WIDTH, minWidth: DATE_WIDTH }} />
            <col style={{ width: TIME_WIDTH, minWidth: TIME_WIDTH }} />
            {INPUT_CATEGORIES.map((category) => (
              <col
                key={category}
                style={{ width: 120, minWidth: 120 }}
              />
            ))}
            <col style={{ width: 76, minWidth: 76 }} />
            {OUTPUT_CATEGORIES.map((category) => (
              <col key={category} style={{ width: 120, minWidth: 120 }} />
            ))}
            <col style={{ width: 76, minWidth: 76 }} />
            <col style={{ width: 92, minWidth: 92 }} />
          </colgroup>

          <thead>
            {/* Group banner */}
            <tr>
              <th
                className="sticky top-0 left-0 z-40 h-[26px] border-b border-[#4a4a4a] border-r px-2 text-left text-[9px] font-bold tracking-widest text-[#999999] uppercase"
                style={{ backgroundColor: "#2f2f2f" }}
              />
              <th
                className="sticky top-0 left-[100px] z-40 h-[26px] border-b border-[#4a4a4a] border-r px-1 text-left text-[9px] font-bold tracking-widest text-[#999999] uppercase"
                style={{ backgroundColor: "#2f2f2f" }}
              />

              <th
                colSpan={INPUT_CATEGORIES.length + 1}
                className="sticky top-0 z-30 h-[26px] border-b border-r border-[#4a4a4a] px-2 text-left text-[9px] font-bold tracking-[0.2em] text-white uppercase"
                style={{ backgroundColor: INPUT_HEADER }}
              >
                Input
              </th>

              <th
                colSpan={OUTPUT_CATEGORIES.length + 1}
                className="sticky top-0 z-30 h-[26px] border-b border-r border-[#8f3333] px-2 text-left text-[9px] font-bold tracking-[0.2em] text-white uppercase"
                style={{ backgroundColor: OUTPUT_HEADER }}
              >
                Output
              </th>

              <th
                className="sticky top-0 z-30 h-[26px] border-b border-[#333333] px-2 text-center text-[9px] font-bold tracking-widest text-white uppercase"
                style={{ backgroundColor: "#3f3f3f" }}
              >
                Balance
              </th>
            </tr>

            {/* Column header */}
            <tr>
              <th
                className="sticky top-[26px] left-0 z-40 h-9 border-b border-r border-[#eeeeee] bg-[#f5f6f8] px-2 text-left text-[10px] font-semibold text-[#555555]"
              >
                Date
              </th>

              <th
                className="sticky top-[26px] left-[100px] z-40 h-9 border-b border-r border-[#eeeeee] bg-[#f5f6f8] px-1 text-left text-[10px] font-semibold text-[#555555]"
              >
                Time
              </th>

              {INPUT_CATEGORIES.map((category) => (
                <th
                  key={category}
                  className="sticky top-[26px] z-30 h-9 border-b border-r border-[#4a4a4a] px-1.5 text-left text-[10px] font-semibold text-white"
                  style={{ backgroundColor: INPUT_HEADER }}
                >
                  {ioConfig(category).label}
                </th>
              ))}

              <th
                className="sticky top-[26px] z-30 h-9 border-b border-r border-[#333333] px-1 text-center text-[10px] font-bold text-white"
                style={{ backgroundColor: "#4a4a4a" }}
              >
                Total Input
              </th>

              {OUTPUT_CATEGORIES.map((category) => (
                <th
                  key={category}
                  className="sticky top-[26px] z-30 h-9 border-b border-r border-[#8f3333] px-1.5 text-left text-[10px] font-semibold text-white"
                  style={{ backgroundColor: OUTPUT_HEADER }}
                >
                  {ioConfig(category).label}
                </th>
              ))}

              <th
                className="sticky top-[26px] z-30 h-9 border-b border-r border-[#8f3333] px-1 text-center text-[10px] font-bold text-white"
                style={{ backgroundColor: "#a03434" }}
              >
                Total Output
              </th>

              <th
                className="sticky top-[26px] z-30 h-9 border-b border-[#333333] px-1 text-center text-[10px] font-bold text-white"
                style={{ backgroundColor: "#4a4a4a" }}
              >
                Fluid Balance
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columnCount}
                  className="px-3 py-12 text-center text-[12px] text-[#888888]"
                >
                  No input / output entries in this range.
                </td>
              </tr>
            ) : (
              orderedRows.map((row, rowIndex) => {
                const hasActivity = row.totalInput > 0 || row.totalOutput > 0;
                const zebra = rowIndex % 2 === 1;
                const rowBg = hasActivity
                  ? row.balance > 0
                    ? "bg-[#f2faf2]"
                    : row.balance < 0
                      ? "bg-[#fdf2f2]"
                      : zebra
                        ? "bg-[#fcfcfc]"
                        : "bg-white"
                  : zebra
                    ? "bg-[#fcfcfc]"
                    : "bg-white";

                const stickyBg =
                  hasActivity && row.balance !== 0
                    ? row.balance > 0
                      ? "bg-[#f2faf2]"
                      : "bg-[#fdf2f2]"
                    : zebra
                      ? "bg-[#fcfcfc]"
                      : "bg-white";

                cumulative += row.balance;

                return (
                  <tr
                    key={row.key}
                    className={cn(
                      "group border-b border-[#eeeeee] transition-colors hover:bg-[#fdf6ec]",
                      rowBg,
                    )}
                  >
                    <td
                      className={cn(
                        "sticky left-0 z-10 border-r border-[#e5e5e5] px-2 py-1 align-top text-[10px] font-semibold whitespace-nowrap text-[#555555]",
                        stickyBg,
                        "group-hover:bg-[#fdf6ec]",
                      )}
                    >
                      {row.date}
                    </td>

                    <td
                      className={cn(
                        "sticky left-[100px] z-10 border-r border-[#e5e5e5] px-1 py-1 align-top text-[11px] font-bold whitespace-nowrap text-[#2b2b2b]",
                        stickyBg,
                        "group-hover:bg-[#fdf6ec]",
                      )}
                    >
                      {row.time}
                    </td>

                    {INPUT_CATEGORIES.map((category) => (
                      <EntryCell
                        key={category}
                        category={category}
                        row={row}
                        onAddEntry={onAddEntry}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onHistory={onHistory}
                      />
                    ))}

                    <td className="border-x border-[#eeeeee] px-1 text-center align-middle text-[12px] font-bold text-[#2b2b2b]">
                      {row.totalInput > 0 ? Math.round(row.totalInput) : "\u2014"}
                    </td>

                    {OUTPUT_CATEGORIES.map((category) => (
                      <EntryCell
                        key={category}
                        category={category}
                        row={row}
                        onAddEntry={onAddEntry}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onHistory={onHistory}
                      />
                    ))}

                    <td className="border-x border-[#eeeeee] px-1 text-center align-middle text-[12px] font-bold text-[#2b2b2b]">
                      {row.totalOutput > 0 ? Math.round(row.totalOutput) : "\u2014"}
                    </td>

                    <BalanceCell
                      value={showCumulative ? cumulative : row.balance}
                      cumulative={showCumulative}
                    />
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-[#eeeeee] bg-[#fcfcfc] px-3 py-1.5 text-[10px] text-[#777777]">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-[#e8f5e9]" />
          positive balance
        </span>

        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-[#fdecea]" />
          negative balance
        </span>

        <span className="ml-auto">
          Click an entry to edit / delete it. Hover for details.
        </span>
      </div>
    </div>
  );
}
