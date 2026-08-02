"use client";

import { useMemo, useState } from "react";

import { ChevronDown, ChevronRight, History, Search, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatIST } from "@/lib/patients/audit";
import type { ProgressNote } from "@/lib/patients/clinical-store";
import {
  NOTE_STATUS_CONFIG,
  formatNoteDateLabel,
} from "@/lib/patients/progress-notes";
import { cn } from "@/lib/utils";
import { NoteContent } from "./note-content";

const DATE_PRESETS = [
  { id: "any", label: "Any time" },
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
] as const;

type DatePresetId = (typeof DATE_PRESETS)[number]["id"];

function isWithinPreset(note: ProgressNote, preset: DatePresetId): boolean {
  const now = new Date();
  const noteDate = new Date(`${note.noteDate}T00:00:00`);

  if (preset === "any") return true;

  const diffDays =
    (now.getTime() - noteDate.getTime()) / (24 * 60 * 60 * 1000);

  if (preset === "today") return diffDays < 1;

  if (preset === "7d") return diffDays <= 7;

  return diffDays <= 30;
}

function NoteCard({
  note,
  active,
  onOpen,
  onViewVersions,
}: {
  note: ProgressNote;
  active: boolean;
  onOpen: (noteId: string) => void;
  onViewVersions: (note: ProgressNote) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const status = NOTE_STATUS_CONFIG[note.status];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[6px] border bg-white transition-colors",
        active
          ? "border-[#d9534f] ring-1 ring-[#d9534f]/20"
          : "border-[#e5bcbc]",
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full cursor-pointer items-start gap-2 bg-[#fff7f7] px-3 py-2 text-left"
      >
        <span className="mt-0.5 text-[#d9534f]">
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-[#333333]">
              {formatNoteDateLabel(note.noteDate)}
            </span>

            <span className="text-[10px] text-[#777777]">
              {formatIST(note.createdAt)}
            </span>

            <span
              className={cn(
                "rounded border px-1.5 py-px text-[9px] font-semibold tracking-wide uppercase",
                status.className,
              )}
            >
              {status.label}
            </span>
          </span>

          <span className="mt-1 block text-[10px] text-[#555555]">
            {note.plainText.slice(0, 90)}
            {note.plainText.length > 90 ? "…" : ""}
          </span>
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[#f0dcdc] px-3 py-2.5">
          <div className="mb-2 grid grid-cols-2 gap-x-3 gap-y-1.5 border-b border-[#f5e3e3] pb-2">
            <div>
              <p className="text-[9px] font-semibold tracking-widest text-[#a05050] uppercase">
                Entered by
              </p>

              <p className="text-[11px] font-medium text-[#333333]">
                {note.createdBy}
              </p>

              <p className="text-[10px] text-[#777777]">{note.department}</p>

              <p className="text-[10px] text-[#999999]">
                Emp ID: {note.employeeId || "—"}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-semibold tracking-widest text-[#a05050] uppercase">
                {note.signedAt ? "Authorized By" : "Status"}
              </p>

              <p className="text-[11px] font-medium text-[#333333]">
                {note.signedAt ? note.authorizedBy || note.signedBy : note.status}
              </p>

              <p className="text-[10px] text-[#777777]">
                {note.signedAt ? formatIST(note.signedAt) : note.versions.length}
                {note.signedAt ? "" : " version(s)"}
              </p>
            </div>
          </div>

          <NoteContent html={note.content} className="max-h-72 overflow-y-auto" />

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {note.status === "Draft" && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => onOpen(note.id)}
                className="text-[10px] text-[#d9534f] hover:bg-[#fdecea]"
              >
                <Stethoscope />

                Open in editor
              </Button>
            )}

            <Button
              variant="outline"
              size="xs"
              onClick={() => onViewVersions(note)}
              className="text-[10px]"
            >
              <History />

              Version history ({note.versions.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function NoteHistory({
  notes,
  activeNoteId,
  onOpenNote,
  onViewVersions,
}: {
  notes: ProgressNote[];
  activeNoteId?: string;
  onOpenNote: (noteId: string) => void;
  onViewVersions: (note: ProgressNote) => void;
}) {
  const [enteredBy, setEnteredBy] = useState("all");
  const [department, setDepartment] = useState("all");
  const [datePreset, setDatePreset] = useState<DatePresetId>("any");
  const [keyword, setKeyword] = useState("");

  const doctors = useMemo(() => {
    const set = new Set(notes.map((note) => note.createdBy));

    return [...set].sort();
  }, [notes]);

  const departments = useMemo(() => {
    const set = new Set(notes.map((note) => note.department).filter(Boolean));

    return [...set].sort();
  }, [notes]);

  const filtered = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return notes
      .filter((note) => {
        if (enteredBy !== "all" && note.createdBy !== enteredBy) return false;

        if (department !== "all" && note.department !== department) return false;

        if (!isWithinPreset(note, datePreset)) return false;

        if (search && !note.plainText.toLowerCase().includes(search)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.noteDate !== b.noteDate) return b.noteDate.localeCompare(a.noteDate);

        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [notes, enteredBy, department, datePreset, keyword]);

  return (
    <section className="overflow-hidden rounded-[6px] border border-[#e5bcbc] bg-[#fff7f7]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5bcbc] bg-[#fff7f7] px-3 py-2">
        <h2 className="text-[13px] font-semibold text-[#333333]">
          Past History
        </h2>

        <span className="text-[10px] text-[#a05050]">
          {filtered.length} note{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="space-y-2 border-b border-[#f0dcdc] bg-[#fff7f7] px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={enteredBy} onValueChange={setEnteredBy}>
            <SelectTrigger size="sm" className="h-7 text-[11px]">
              <SelectValue placeholder="Entered by" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All doctors</SelectItem>

              {doctors.map((doctor) => (
                <SelectItem key={doctor} value={doctor}>
                  {doctor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger size="sm" className="h-7 text-[11px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>

              {departments.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={datePreset}
            onValueChange={(value) => setDatePreset(value as DatePresetId)}
          >
            <SelectTrigger size="sm" className="h-7 text-[11px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {DATE_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Search className="absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-[#999999]" />

          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search notes (e.g. headache)..."
            className="h-7 pl-7 text-[11px]"
          />
        </div>
      </div>

      <div className="max-h-[calc(100dvh-430px)] min-h-[280px] space-y-2 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
            <History className="h-6 w-6 text-[#cfa0a0]" />

            <p className="mt-2 text-[12px] font-medium text-[#a05050]">
              No progress notes found
            </p>

            <p className="mt-1 max-w-[220px] text-[10px] text-[#c08a8a]">
              Adjust the filters or search keyword to see more notes.
            </p>
          </div>
        ) : (
          filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              active={note.id === activeNoteId}
              onOpen={onOpenNote}
              onViewVersions={onViewVersions}
            />
          ))
        )}
      </div>
    </section>
  );
}
