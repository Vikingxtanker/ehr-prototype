"use client";

import type { ReactNode } from "react";

import type { AuditFields } from "@/lib/patients/clinical-store";
import { formatIST } from "@/lib/patients/audit";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AuditTooltip({
  audit,
  children,
}: {
  audit: AuditFields;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>

      <TooltipContent
        side="top"
        align="center"
        className="max-w-xs flex-col items-start gap-1"
      >
        <span className="text-[11px] font-semibold text-white">
          Added by {audit.createdBy || "Unknown"} on{" "}
          {audit.createdAt ? formatIST(audit.createdAt) : "—"} IST
        </span>

        {audit.updatedBy && audit.updatedAt && (
          <span className="text-[11px] text-white/80">
            Edited by {audit.updatedBy} on {formatIST(audit.updatedAt)} IST
          </span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
