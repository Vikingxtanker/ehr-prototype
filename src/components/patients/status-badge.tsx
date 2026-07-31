import { STATUS_LABELS, type PatientStatus } from "@/lib/constants/patient";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<PatientStatus, string> = {
  admitted: "bg-blue-50 text-blue-700 ring-blue-200",
  stable: "bg-green-50 text-green-700 ring-green-200",
  critical: "bg-red-50 text-red-700 ring-red-200",
  observation: "bg-amber-50 text-amber-700 ring-amber-200",
  recovering: "bg-violet-50 text-violet-700 ring-violet-200",
  discharged: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function StatusBadge({ status }: { status: PatientStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        STATUS_STYLES[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {STATUS_LABELS[status]}
    </span>
  );
}
