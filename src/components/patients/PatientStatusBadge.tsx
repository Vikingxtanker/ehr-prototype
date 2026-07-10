import { Badge } from "@/components/ui/badge";

import { PatientStatus } from "@/types/patient";

interface PatientStatusBadgeProps {
  status: PatientStatus;
}

const statusStyles: Record<PatientStatus, string> = {
  Stable:
    "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",

  Critical:
    "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",

  Observation:
    "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",

  Surgery:
    "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",

  Consultation:
    "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-100",

  Discharged:
    "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",
};

export default function PatientStatusBadge({
  status,
}: PatientStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`
        rounded-full
        px-3
        py-1
        font-medium
        ${statusStyles[status]}
      `}
    >
      <span className="mr-2 h-2 w-2 rounded-full bg-current opacity-70" />

      {status}
    </Badge>
  );
}