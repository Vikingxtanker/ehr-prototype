"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { toast } from "sonner";

import {
  FileCheck2,
  FileSignature,
  History,
  Plus,
  Printer,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClinicalRecords } from "@/hooks/use-clinical-records";
import { getSession } from "@/lib/auth/demo-auth";
import {
  addProgressNote,
  finalizeProgressNote,
  saveProgressNote,
  signProgressNote,
  updateProgressNoteMeta,
  type ProgressNote,
} from "@/lib/patients/clinical-store";
import { formatIST, getCurrentUserName, todayISTInputValue } from "@/lib/patients/audit";
import {
  DEPARTMENTS,
  NOTE_TEMPLATES,
  NOTE_STATUS_CONFIG,
  buildStructuredTemplate,
  htmlToPlainText,
} from "@/lib/patients/progress-notes";
import { getPatientFullName, type Patient } from "@/lib/types/patient";
import { cn } from "@/lib/utils";
import { NoteHistory } from "./note-history";
import { RichTextEditor } from "./rich-text-editor";
import {
  SignatureDialog,
  type SignatureMeta,
} from "./signature-dialog";
import { VersionHistoryDialog } from "./version-history-dialog";

const AUTOSAVE_MS = 45_000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function DoctorsNotes({ patient }: { patient: Patient }) {
  const records = useClinicalRecords(patient.id);
  const notes = records.progressNotes;

  const session = getSession();
  const actor = getCurrentUserName();
  const isReadOnlyRole = session?.role === "Nurse";
  const canEdit = !isReadOnlyRole;

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [draftHtml, setDraftHtml] = useState(() => buildStructuredTemplate());
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [employeeId, setEmployeeId] = useState("");
  const [noteDate, setNoteDate] = useState(() => todayISTInputValue());

  const [leftWidth, setLeftWidth] = useState(60);
  const [versionNote, setVersionNote] = useState<ProgressNote | null>(null);
  const [signNote, setSignNote] = useState<ProgressNote | null>(null);

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeNoteId) ?? null,
    [notes, activeNoteId],
  );

  const editorReadOnly =
    !canEdit || (activeNote !== null && activeNote.status !== "Draft");

  const draftHtmlRef = useRef(draftHtml);
  const activeNoteIdRef = useRef(activeNoteId);
  const metaRef = useRef({ department, employeeId, noteDate });
  const dirtyRef = useRef(dirty);
  const lockRef = useRef(false);

  useEffect(() => {
    draftHtmlRef.current = draftHtml;
  }, [draftHtml]);

  useEffect(() => {
    activeNoteIdRef.current = activeNoteId;
  }, [activeNoteId]);

  useEffect(() => {
    metaRef.current = { department, employeeId, noteDate };
  }, [department, employeeId, noteDate]);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  const saveCurrent = useCallback(
    (changeSummary: string) => {
      const html = draftHtmlRef.current;
      const plainText = htmlToPlainText(html);
      const currentActor = getCurrentUserName();

      if (activeNoteIdRef.current) {
        saveProgressNote(
          patient.id,
          activeNoteIdRef.current,
          html,
          plainText,
          currentActor,
          changeSummary,
        );

        updateProgressNoteMeta(
          patient.id,
          activeNoteIdRef.current,
          metaRef.current,
          currentActor,
        );
      } else {
        const id = addProgressNote(
          patient.id,
          {
            content: html,
            plainText,
            status: "Draft",
            department: metaRef.current.department,
            employeeId: metaRef.current.employeeId,
            noteDate: metaRef.current.noteDate,
          },
          currentActor,
        );

        setActiveNoteId(id);
      }

      setDirty(false);
      setLastSavedAt(new Date().toISOString());
    },
    [patient.id],
  );

  const saveDraft = useCallback(() => {
    saveCurrent("Draft saved");
    toast.success("Draft saved");
  }, [saveCurrent]);

  const handleSaveProgressNote = useCallback(() => {
    saveCurrent("Progress note saved");
    toast.success("Progress note saved");
  }, [saveCurrent]);

  const handleEditorChange = useCallback((html: string) => {
    setDraftHtml(html);
    setDirty(true);
  }, []);

  const handleFinalize = useCallback(() => {
    if (!activeNoteIdRef.current) {
      toast.error("Save the note before finalizing it.");
      return;
    }

    finalizeProgressNote(patient.id, activeNoteIdRef.current, getCurrentUserName());
    toast.success("Note finalized. It is now read only.");
  }, [patient.id]);

  const handleSignConfirm = useCallback(
    (meta: SignatureMeta) => {
      if (!activeNoteIdRef.current) return;

      signProgressNote(patient.id, activeNoteIdRef.current, getCurrentUserName(), meta);
      setSignNote(null);

      setActiveNoteId(null);
      setDraftHtml(buildStructuredTemplate());
      setDirty(false);
      setLastSavedAt(null);

      toast.success("Note electronically signed.");
    },
    [patient.id],
  );

  const handleNewNote = useCallback(() => {
    if (dirtyRef.current) {
      saveCurrent("Saved before new note");
    }

    setActiveNoteId(null);
    setDraftHtml(buildStructuredTemplate());
    setDirty(false);
    setLastSavedAt(null);
  }, [saveCurrent]);

  const handleOpenNote = useCallback(
    (noteId: string) => {
      const note = notes.find((item) => item.id === noteId);

      if (!note || note.status !== "Draft") return;

      if (dirtyRef.current) saveCurrent("Saved before opening another note");

      setActiveNoteId(note.id);
      setDraftHtml(note.content);
      setDepartment(note.department);
      setEmployeeId(note.employeeId);
      setNoteDate(note.noteDate);
      setDirty(false);
      setLastSavedAt(note.updatedAt ?? note.createdAt);
    },
    [notes, saveCurrent],
  );

  const applyTemplate = useCallback((content: string) => {
    setDraftHtml(content);
    setDirty(true);
    toast.success("Template applied to the editor.");
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lockRef.current) return;

      if (!dirtyRef.current) return;

      const id = activeNoteIdRef.current;

      if (id) {
        const current = notes.find((note) => note.id === id);

        if (current && current.status !== "Draft") return;
      }

      saveCurrent("Auto-saved draft");
    }, AUTOSAVE_MS);

    return () => clearInterval(interval);
  }, [saveCurrent, notes]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();

        if (editorReadOnly) return;

        lockRef.current = true;
        saveDraft();
        window.setTimeout(() => {
          lockRef.current = false;
        }, 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editorReadOnly, saveDraft]);

  const splitRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleDragStart = (event: React.PointerEvent) => {
    event.preventDefault();

    dragState.current = { startX: event.clientX, startWidth: leftWidth };

    const move = (moveEvent: PointerEvent) => {
      const state = dragState.current;
      const rect = splitRef.current?.getBoundingClientRect();

      if (!state || !rect) return;

      const delta = ((moveEvent.clientX - state.startX) / rect.width) * 100;

      setLeftWidth(clamp(state.startWidth + delta, 35, 70));
    };

    const end = () => {
      dragState.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };

  const status = activeNote ? NOTE_STATUS_CONFIG[activeNote.status] : null;

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-[6px] border border-[#e5c5c5] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5e5e5] bg-white px-3 py-2">
          <h1 className="text-[18px] font-semibold text-[#333333]">
            Doctor&apos;s Daily Progress Notes
          </h1>

          <p className="text-[11px] text-[#888888]">
            {getPatientFullName(patient)} · UHID {patient.uhid} ·{" "}
            {actor}
          </p>
        </div>

        <div ref={splitRef} className="flex items-stretch gap-0">
          <div
            className="min-w-0 border-r border-[#eeeeee] p-3"
            style={{ width: `${leftWidth}%` }}
          >
            {/* Note meta */}
            <div className="mb-2 flex flex-wrap items-end gap-2 rounded-[6px] border border-[#eeeeee] bg-[#fcfcfc] px-3 py-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-[#777777]">Note Date</Label>

                <Input
                  type="date"
                  value={noteDate}
                  onChange={(event) => {
                    setNoteDate(event.target.value);

                    if (activeNoteId) {
                      updateProgressNoteMeta(
                        patient.id,
                        activeNoteId,
                        { ...metaRef.current, noteDate: event.target.value },
                        getCurrentUserName(),
                      );
                    }
                  }}
                  className="h-7 w-36 text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-[#777777]">
                  Department
                </Label>

                <Select
                  value={department}
                  onValueChange={(value) => {
                    setDepartment(value);

                    if (activeNoteId) {
                      updateProgressNoteMeta(
                        patient.id,
                        activeNoteId,
                        { ...metaRef.current, department: value },
                        getCurrentUserName(),
                      );
                    }
                  }}
                >
                  <SelectTrigger size="sm" className="h-7 w-44 text-[11px]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {DEPARTMENTS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-[#777777]">
                  Employee ID
                </Label>

                <Input
                  value={employeeId}
                  onChange={(event) => {
                    setEmployeeId(event.target.value);

                    if (activeNoteId) {
                      updateProgressNoteMeta(
                        patient.id,
                        activeNoteId,
                        { ...metaRef.current, employeeId: event.target.value },
                        getCurrentUserName(),
                      );
                    }
                  }}
                  placeholder="e.g. E-1042"
                  className="h-7 w-28 text-[11px]"
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                {status && (
                  <span
                    className={cn(
                      "rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                )}

                {dirty ? (
                  <span className="flex items-center gap-1 text-[10px] text-[#b8860b]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e0a800]" />

                    Unsaved changes
                  </span>
                ) : lastSavedAt ? (
                  <span className="flex items-center gap-1 text-[10px] text-[#2e7d32]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2e7d32]" />

                    Draft saved {formatIST(lastSavedAt)}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#999999]">
                    {activeNoteId ? "Loaded" : "New note"}
                  </span>
                )}

                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleNewNote}
                  className="text-[10px] text-[#d9534f] hover:bg-[#fdecea]"
                >
                  <Plus />

                  New Note
                </Button>
              </div>
            </div>

            {/* Templates */}
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold tracking-widest text-[#888888] uppercase">
                Templates
              </span>

              {NOTE_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="xs"
                  onClick={() => applyTemplate(template.content)}
                  className="border-[#e5bcbc] text-[10px] text-[#a05050] hover:bg-[#fff7f7]"
                >
                  {template.label}
                </Button>
              ))}

              <Button
                variant="ghost"
                size="xs"
                onClick={() => applyTemplate(buildStructuredTemplate())}
                className="text-[10px] text-[#777777]"
              >
                Structured headings
              </Button>
            </div>

            <RichTextEditor
              key={activeNoteId ?? "new"}
              content={draftHtml}
              onChange={handleEditorChange}
              readOnly={editorReadOnly}
            />
          </div>

          {/* Draggable divider */}
          <div
            className="group relative w-1.5 shrink-0 cursor-col-resize bg-[#f0e0e0] transition-colors hover:bg-[#d9534f]"
            onPointerDown={handleDragStart}
            role="separator"
            aria-orientation="vertical"
            title="Drag to resize"
          >
            <span className="absolute top-1/2 left-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e0c0c0] group-hover:bg-[#d9534f]" />
          </div>

          <div className="min-w-0 flex-1 p-3">
            <NoteHistory
              notes={notes}
              activeNoteId={activeNoteId ?? undefined}
              onOpenNote={handleOpenNote}
              onViewVersions={setVersionNote}
            />
          </div>
        </div>

        {/* Footer actions */}
        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-[#e5e5e5] bg-white px-3 py-2">
          <span className="mr-auto flex items-center gap-1.5 text-[10px] text-[#999999]">
            <History className="h-3.5 w-3.5" />

            {notes.length} note{notes.length === 1 ? "" : "s"} in the record
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-8 text-[11px]"
          >
            <Printer />

            Print
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={saveDraft}
            disabled={
              editorReadOnly || activeNote?.status === "Finalized"
            }
            className="h-8 text-[11px]"
          >
            <Save />

            Save Draft
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveProgressNote}
            disabled={editorReadOnly}
            className="h-8 border-[#d9534f] text-[11px] text-[#d9534f] hover:bg-[#fdecea]"
          >
            <FileCheck2 />

            Save Progress Note
          </Button>

          <Button
            size="sm"
            onClick={handleFinalize}
            disabled={
              !activeNoteId ||
              editorReadOnly ||
              activeNote?.status !== "Draft"
            }
            className="h-8 bg-[#d9534f] text-white hover:bg-[#c94f4b]"
          >
            <FileCheck2 />

            Finalize Note
          </Button>

          <Button
            size="sm"
            onClick={() => setSignNote(activeNote)}
            disabled={
              !activeNoteId ||
              editorReadOnly ||
              (activeNote?.status !== "Draft" &&
                activeNote?.status !== "Finalized")
            }
            className="h-8 bg-[#2e7d32] text-white hover:bg-[#256b29]"
          >
            <FileSignature />

            Electronically Sign
          </Button>
        </footer>
      </section>

      <VersionHistoryDialog
        note={versionNote}
        onOpenChange={(open) => {
          if (!open) setVersionNote(null);
        }}
      />

      <SignatureDialog
        note={signNote}
        doctorName={actor}
        onConfirm={handleSignConfirm}
        onOpenChange={(open) => {
          if (!open) setSignNote(null);
        }}
      />
    </div>
  );
}
