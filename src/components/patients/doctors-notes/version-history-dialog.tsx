"use client";

import { useState } from "react";

import { ChevronDown, ChevronRight, FileSignature, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatIST } from "@/lib/patients/audit";
import type { ProgressNote } from "@/lib/patients/clinical-store";
import { NoteContent } from "./note-content";

function VersionRow({
  version,
}: {
  version: ProgressNote["versions"][number];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-[6px] border border-[#eeeeee] bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left hover:bg-[#fcfcfc]"
      >
        <span className="text-[#d9534f]">
          {open ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </span>

        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fdecea] text-[10px] font-bold text-[#d9534f]">
          v{version.version}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold text-[#333333]">
            {version.author}
          </span>

          <span className="block text-[10px] text-[#777777]">
            {formatIST(version.timestamp)}
          </span>
        </span>

        <span className="max-w-[180px] truncate text-[10px] text-[#999999]">
          {version.changeSummary || "Content revision"}
        </span>
      </button>

      {open && (
        <div className="border-t border-[#f0f0f0] px-3 py-2.5">
          <NoteContent html={version.content} />
        </div>
      )}
    </div>
  );
}

export function VersionHistoryDialog({
  note,
  onOpenChange,
}: {
  note: ProgressNote | null;
  onOpenChange: (open: boolean) => void;
}) {
  const versions = note ? [...note.versions].reverse() : [];

  return (
    <Dialog open={note !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>

        {note && (
          <div className="space-y-3">
            {note.status === "Signed" && (
              <div className="flex items-center gap-2 rounded-[6px] border border-[#b7d7c0] bg-[#eef7f0] px-3 py-2 text-[11px] text-[#2e7d32]">
                <ShieldCheck className="h-4 w-4" />

                <span>
                  This note is electronically signed — it is read only and
                  cannot be edited.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 rounded-[6px] border border-[#eeeeee] bg-[#fcfcfc] px-3 py-2 text-[11px]">
              <span className="text-[#555555]">
                <span className="font-semibold text-[#333333]">Entered by:</span>{" "}
                {note.createdBy}
              </span>

              <span className="text-[#555555]">
                <span className="font-semibold text-[#333333]">
                  Department:
                </span>{" "}
                {note.department}
              </span>

              <span className="text-[#555555]">
                <span className="font-semibold text-[#333333]">
                  Last modified:
                </span>{" "}
                {note.updatedAt ? formatIST(note.updatedAt) : "—"}
              </span>

              <span className="text-[#555555]">
                <span className="font-semibold text-[#333333]">Versions:</span>{" "}
                {note.versions.length}
              </span>
            </div>

            <div className="max-h-[50vh] space-y-2 overflow-y-auto">
              {versions.map((version) => (
                <VersionRow key={version.version} version={version} />
              ))}
            </div>

            {note.signedAt && (
              <div className="flex items-center gap-2 rounded-[6px] border border-[#e5bcbc] bg-[#fff7f7] px-3 py-2 text-[11px] text-[#a05050]">
                <FileSignature className="h-4 w-4" />

                <span>
                  Signed by <span className="font-semibold">{note.signedBy}</span>{" "}
                  on {formatIST(note.signedAt)}
                  {note.authorizedBy && note.authorizedBy !== note.signedBy
                    ? ` · authorized by ${note.authorizedBy}`
                    : ""}
                </span>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
