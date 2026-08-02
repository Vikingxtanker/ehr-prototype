"use client";

import { useEffect, useState } from "react";

import { BadgeCheck, FileSignature } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatIST } from "@/lib/patients/audit";
import type { ProgressNote } from "@/lib/patients/clinical-store";
import { formatNoteDateLabel } from "@/lib/patients/progress-notes";

export interface SignatureMeta {
  employeeId: string;
  authorizedBy: string;
  ip: string;
  device: string;
}

function detectDevice(): string {
  if (typeof navigator === "undefined") return "Unknown device";

  const parts = [
    navigator.platform,
    navigator.userAgent
      ?.match(/\(([^)]+)\)/)?.[1]
      ?.split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(" · "),
  ].filter(Boolean);

  return parts.join(" — ") || "Unknown device";
}

export function SignatureDialog({
  note,
  doctorName,
  onConfirm,
  onOpenChange,
}: {
  note: ProgressNote | null;
  doctorName: string;
  onConfirm: (meta: SignatureMeta) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState(doctorName);
  const [device] = useState(() => detectDevice());
  const [ip, setIp] = useState("Unavailable");

  useEffect(() => {
    if (note === null) return;

    let cancelled = false;

    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data: { ip?: string }) => {
        if (!cancelled && data?.ip) setIp(data.ip);
      })
      .catch(() => {
        if (!cancelled) setIp("Unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, [note, doctorName]);

  if (!note) return null;

  return (
    <Dialog open={note !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Electronic Signature</DialogTitle>

          <DialogDescription>
            Signing finalizes this progress note and makes it part of the
            permanent medical record. Signed notes cannot be edited.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-[6px] border border-[#e5bcbc] bg-[#fff7f7] px-3 py-2.5">
            <FileSignature className="h-5 w-5 shrink-0 text-[#d9534f]" />

            <div className="text-[11px] text-[#555555]">
              <p>
                Progress note dated{" "}
                <span className="font-semibold text-[#333333]">
                  {formatNoteDateLabel(note.noteDate)}
                </span>
              </p>

              <p>
                Entered by{" "}
                <span className="font-semibold text-[#333333]">
                  {note.createdBy}
                </span>{" "}
                · {note.department}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#555555]">
                Signing Doctor
              </Label>

              <div className="flex h-8 items-center rounded-lg border border-[#eeeeee] bg-[#fcfcfc] px-2.5 text-[12px] font-medium text-[#333333]">
                {doctorName}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#555555]">
                Employee ID
              </Label>

              <Input
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                placeholder="e.g. E-1042"
                className="h-8 text-[12px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#555555]">
                Authorized By
              </Label>

              <Input
                value={authorizedBy}
                onChange={(event) => setAuthorizedBy(event.target.value)}
                placeholder="Consultant name"
                className="h-8 text-[12px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#555555]">
                Date & Time (IST)
              </Label>

              <div className="flex h-8 items-center rounded-lg border border-[#eeeeee] bg-[#fcfcfc] px-2.5 text-[12px] text-[#333333]">
                {formatIST(new Date().toISOString())}
              </div>
            </div>
          </div>

          <div className="rounded-[6px] border border-[#eeeeee] bg-[#fcfcfc] px-3 py-2 text-[10px] leading-relaxed text-[#777777]">
            <p className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-[#2e7d32]" />

              Digital signature status: Pending — a signing event will be
              recorded in the version history and audit trail.
            </p>

            <p className="mt-1">
              Device: {device} · IP address: {ip}
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button
            onClick={() =>
              onConfirm({
                employeeId: employeeId.trim(),
                authorizedBy: authorizedBy.trim() || doctorName,
                ip,
                device,
              })
            }
            className="bg-[#d9534f] text-white hover:bg-[#c94f4b]"
          >
            <FileSignature />

            Sign & Finalize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
