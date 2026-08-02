"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatIST } from "@/lib/patients/audit";
import type { IoEntry } from "@/lib/patients/clinical-store";
import { formatEntryVolume, formatTimeLabel, ioConfig } from "@/lib/patients/io-chart";
import { cn } from "@/lib/utils";

function AuditRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "green" | "red";
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#f0f0f0] py-1.5 last:border-b-0">
      <span className="text-[11px] text-[#888888]">{label}</span>

      <span
        className={cn(
          "text-right text-[11px] font-semibold text-[#333333]",
          tone === "green" && "text-[#2e7d32]",
          tone === "red" && "text-[#c62828]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function IoHistoryDialog({
  entry,
  onOpenChange,
}: {
  entry: IoEntry | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!entry) return null;

  const config = ioConfig(entry.category);
  const volume = formatEntryVolume(entry);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Entry History</DialogTitle>
        </DialogHeader>

        <div>
          <div
            className={cn(
              "mb-3 flex items-center justify-between rounded-lg px-3 py-2",
              config.group === "input"
                ? "bg-[#f0f0f0]"
                : "bg-[#fdecea]",
            )}
          >
            <div>
              <p className="text-[13px] font-bold text-[#2b2b2b]">
                {config.label}
              </p>

              <p className="text-[11px] text-[#555555]">
                {formatTimeLabel(entry.recordedAt)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[16px] font-bold text-[#2b2b2b]">
                {volume || "—"}
              </p>

              <p className="text-[10px] text-[#555555] uppercase">
                {config.group}
              </p>
            </div>
          </div>

          <AuditRow
            label="Description"
            value={entry.description || "\u2014"}
          />
          <AuditRow label="Route" value={entry.route || "\u2014"} />
          <AuditRow label="Recorded By" value={entry.recordedBy || "\u2014"} />
          <AuditRow
            label="Recorded Time"
            value={entry.recordedAt ? formatIST(entry.recordedAt) : "\u2014"}
          />
          <AuditRow
            label="Remarks"
            value={entry.remarks || "\u2014"}
          />
          <AuditRow
            label="Created By"
            value={`${entry.createdBy || "Unknown"} · ${formatIST(entry.createdAt)}`}
          />
          {entry.updatedBy && entry.updatedAt && (
            <AuditRow
              label="Last Modified"
              value={`${entry.updatedBy} · ${formatIST(entry.updatedAt)}`}
              tone="red"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
