"use client";

import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

export type OrderStatus = "Ordered" | "Completed" | "Pending" | "Cancelled";
export type Priority = "STAT" | "Routine" | "Urgent" | "PRN";
export type MedStatus =
  | "Prescribed"
  | "Dispensed"
  | "Administered"
  | "Completed"
  | "Stopped";

export interface AuditFields {
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Complaint extends AuditFields {
  id: string;
  text: string;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface Diagnosis extends AuditFields {
  id: string;
  text: string;
  icdCode?: string;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface Order extends AuditFields {
  id: string;
  date: string;
  order: string;
  status: OrderStatus;
  department: string;
}

export type VitalFieldKey = Exclude<
  keyof VitalReading,
  "id" | "createdBy" | "createdAt" | "updatedBy" | "updatedAt" | "fieldAudit"
>;

export interface FieldAudit {
  at: string;
  by: string;
}

export interface VitalReading extends AuditFields {
  id: string;
  height: string;
  weight: string;
  bmi: string;
  temperature: string;
  heartRate: string;
  respiratoryRate: string;
  systolicBP: string;
  diastolicBP: string;
  spo2: string;
  bloodSugar: string;
  painScore: string;
  gcs: string;
  gcsEye: string;
  gcsVerbal: string;
  gcsMotor: string;
  avpu: string;
  urineOutput: string;
  remarks: string;
  fieldAudit?: Partial<Record<VitalFieldKey, FieldAudit>>;
}

export type VitalValues = Omit<
  VitalReading,
  "id" | keyof AuditFields | "fieldAudit"
>;

export interface Medication extends AuditFields {
  id: string;
  drug: string;
  form?: string;
  strength?: string;
  priority: Priority;
  route: string;
  frequency: string;
  unit?: string;
  frequencyType?: "Daily" | "Weekly";
  dose: string;
  schedule: string;
  duration: string;
  durationUnit?: "Days" | "Weeks" | "Months";
  instructions?: string;
  quantity?: string;
  remarks?: string;
  statDose?: boolean;
  sos?: boolean;
  patientOwnMed?: boolean;
  taperDose?: boolean;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  status: MedStatus;
  held?: boolean;
  statusBeforeStop?: MedStatus;
  stoppedBy?: string;
  stoppedAt?: string;
}

export type MARAdministrationStatus =
  | "Scheduled"
  | "Administered"
  | "Missed"
  | "Delayed"
  | "Held";

export interface MedicationAdministration extends AuditFields {
  id: string;
  medicationId: string;
  scheduledAt: string;
  status: MARAdministrationStatus;
  givenAt?: string;
  dose?: string;
  route?: string;
  administeredBy?: string;
  batchNumber?: string;
  expiryDate?: string;
  site?: string;
  remarks?: string;
  reason?: string;
}

export type IoCategory =
  | "oral"
  | "rtFeed"
  | "iv"
  | "bloodProduct"
  | "irrigation"
  | "urine"
  | "drain"
  | "aspiration"
  | "bowel"
  | "vomit"
  | "other";

export interface IoEntry extends AuditFields {
  id: string;
  category: IoCategory;
  volume: string;
  description: string;
  route: string;
  recordedBy: string;
  recordedAt: string;
  remarks?: string;
}

export type ProgressNoteStatus = "Draft" | "Finalized" | "Signed";

export interface ProgressNoteVersion {
  version: number;
  author: string;
  timestamp: string;
  content: string;
  changeSummary?: string;
}

export interface ProgressNote extends AuditFields {
  id: string;
  content: string;
  plainText: string;
  status: ProgressNoteStatus;
  department: string;
  employeeId: string;
  noteDate: string;
  versions: ProgressNoteVersion[];
  signedBy?: string;
  signedAt?: string;
  signedEmployeeId?: string;
  authorizedBy?: string;
  signatureIp?: string;
  signatureDevice?: string;
}

export interface ClinicalRecords {
  complaints: Complaint[];
  diagnoses: Diagnosis[];
  orders: Order[];
  vitals: VitalReading[];
  medications: Medication[];
  administrations: MedicationAdministration[];
  ioEntries: IoEntry[];
  progressNotes: ProgressNote[];
}

export const EMPTY_RECORDS: ClinicalRecords = {
  complaints: [],
  diagnoses: [],
  orders: [],
  vitals: [],
  medications: [],
  administrations: [],
  ioEntries: [],
  progressNotes: [],
};

const listeners = new Set<() => void>();
const cache = new Map<string, ClinicalRecords>();
const writeQueues = new Map<string, Promise<void>>();
const versions = new Map<string, number>();
const loading = new Set<string>();
const hydrated = new Set<string>();

function backfillCreatedAt<T extends AuditFields>(
  items: unknown[] | undefined,
): T[] {
  return (items ?? []).map((item) => {
    const record = (item ?? {}) as Partial<T> &
      Record<string, unknown> & { addedAt?: string; recordedAt?: string };

    return {
      ...record,
      createdAt:
        record.createdAt ??
        record.addedAt ??
        record.recordedAt ??
        new Date(0).toISOString(),
      createdBy: record.createdBy ?? "Unknown",
    } as T;
  });
}

function migrateVitals(vitals: unknown[] | undefined): VitalReading[] {
  return (vitals ?? []).map((item) => {
    const record = (item ?? {}) as VitalReading & {
      bloodPressure?: string;
    };

    const { bloodPressure, ...rest } = record;

    if (!rest.systolicBP && !rest.diastolicBP && bloodPressure) {
      const [sys, dia] = bloodPressure.split("/");

      return {
        ...rest,
        systolicBP: (sys ?? "").trim(),
        diastolicBP: (dia ?? "").trim(),
      };
    }

    return rest;
  });
}

function backfillProgressNotes(items: unknown[] | undefined): ProgressNote[] {
  return (items ?? []).map((item) => {
    const record = (item ?? {}) as Partial<ProgressNote> & {
      addedAt?: string;
      recordedAt?: string;
    };

    return {
      ...record,
      createdAt:
        record.createdAt ??
        record.addedAt ??
        record.recordedAt ??
        new Date(0).toISOString(),
      createdBy: record.createdBy ?? "Unknown",
      versions: Array.isArray(record.versions) ? record.versions : [],
    } as ProgressNote;
  });
}

function normalize(records: unknown): ClinicalRecords {
  const parsed = (records ?? {}) as Partial<ClinicalRecords>;

  return {
    complaints: backfillCreatedAt<Complaint>(parsed.complaints),
    diagnoses: backfillCreatedAt<Diagnosis>(parsed.diagnoses),
    orders: backfillCreatedAt<Order>(parsed.orders),
    vitals: backfillCreatedAt<VitalReading>(migrateVitals(parsed.vitals)),
    medications: backfillCreatedAt<Medication>(parsed.medications),
    administrations: backfillCreatedAt<MedicationAdministration>(
      parsed.administrations,
    ),
    ioEntries: backfillCreatedAt<IoEntry>(parsed.ioEntries),
    progressNotes: backfillProgressNotes(parsed.progressNotes),
  };
}

export function getClinicalRecordsSnapshot(
  patientId: string,
): ClinicalRecords {
  return cache.get(patientId) ?? EMPTY_RECORDS;
}

export function hydrateClinicalRecords(patientId: string): void {
  if (loading.has(patientId)) return;

  loading.add(patientId);

  const versionAtStart = versions.get(patientId) ?? 0;

  createClient()
    .from("clinical_records")
    .select("data")
    .eq("patient_id", patientId)
    .maybeSingle()
    .then(
      (
        result: {
          data: { data?: unknown } | null;
          error: { message: string } | null;
        },
      ) => {
        const { data, error } = result;

        if (error) {
          console.error("Could not load clinical data:", error.message);

          return;
        }

        if ((versions.get(patientId) ?? 0) === versionAtStart) {
          cache.set(patientId, normalize(data?.data));

          hydrated.add(patientId);
        }
      },
    )
    .catch((error: unknown) => {
      console.error("Could not load clinical data:", error);
    })
    .finally(() => {
      loading.delete(patientId);
      emit();
    });
}

export function subscribeClinicalRecords(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

function update(
  patientId: string,
  updater: (records: ClinicalRecords) => ClinicalRecords,
): void {
  if (!hydrated.has(patientId)) {
    console.warn(
      `Skipped clinical-data write for ${patientId}: record has not finished loading.`,
    );

    return;
  }

  const current = cache.get(patientId) ?? { ...EMPTY_RECORDS };
  const next = updater(current);

  cache.set(patientId, next);
  versions.set(patientId, (versions.get(patientId) ?? 0) + 1);

  enqueuePersist(patientId);
  emit();
}

function enqueuePersist(patientId: string): void {
  const previous = writeQueues.get(patientId) ?? Promise.resolve();

  const next = previous
    .then(() => persist(patientId))
    .catch((error) => {
      console.error(error);

      toast.error("Could not sync clinical data to the cloud.");
    });

  writeQueues.set(patientId, next);
}

async function persist(patientId: string): Promise<void> {
  const snapshot = cache.get(patientId) ?? { ...EMPTY_RECORDS };

  const { error } = await createClient()
    .from("clinical_records")
    .upsert(
      {
        patient_id: patientId,
        data: snapshot,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "patient_id" },
    );

  if (error) throw error;
}

export function flushClinical(patientId: string): Promise<void> {
  return writeQueues.get(patientId) ?? Promise.resolve();
}

function now(): string {
  return new Date().toISOString();
}

function markEdited<T extends AuditFields>(record: T, actor: string): T {
  return {
    ...record,
    updatedBy: actor,
    updatedAt: now(),
  };
}

export function addComplaint(
  patientId: string,
  text: string,
  actor: string,
): void {
  const complaint: Complaint = {
    id: crypto.randomUUID(),
    text,
    createdAt: now(),
    createdBy: actor,
  };

  update(patientId, (records) => ({
    ...records,
    complaints: [complaint, ...records.complaints],
  }));
}

export function removeComplaint(patientId: string, id: string): void {
  update(patientId, (records) => ({
    ...records,
    complaints: records.complaints.filter((item) => item.id !== id),
  }));
}

export function updateComplaint(
  patientId: string,
  id: string,
  text: string,
  actor: string,
): void {
  update(patientId, (records) => ({
    ...records,
    complaints: records.complaints.map((item) =>
      item.id === id ? markEdited({ ...item, text }, actor) : item,
    ),
  }));
}

export function toggleResolvedComplaint(
  patientId: string,
  id: string,
  actor: string,
): void {
  const timestamp = now();

  update(patientId, (records) => ({
    ...records,
    complaints: records.complaints.map((item) => {
      if (item.id !== id) return item;

      if (item.resolved) {
        return {
          ...item,
          resolved: false,
          resolvedBy: undefined,
          resolvedAt: undefined,
          updatedBy: actor,
          updatedAt: timestamp,
        };
      }

      return {
        ...item,
        resolved: true,
        resolvedBy: actor,
        resolvedAt: timestamp,
        updatedBy: actor,
        updatedAt: timestamp,
      };
    }),
  }));
}

export function addDiagnosis(
  patientId: string,
  text: string,
  icdCode: string,
  actor: string,
): void {
  const diagnosis: Diagnosis = {
    id: crypto.randomUUID(),
    text,
    icdCode: icdCode.trim() || undefined,
    createdAt: now(),
    createdBy: actor,
  };

  update(patientId, (records) => ({
    ...records,
    diagnoses: [diagnosis, ...records.diagnoses],
  }));
}

export function removeDiagnosis(patientId: string, id: string): void {
  update(patientId, (records) => ({
    ...records,
    diagnoses: records.diagnoses.filter((item) => item.id !== id),
  }));
}

export function updateDiagnosis(
  patientId: string,
  id: string,
  text: string,
  icdCode: string,
  actor: string,
): void {
  update(patientId, (records) => ({
    ...records,
    diagnoses: records.diagnoses.map((item) =>
      item.id === id
        ? markEdited(
            { ...item, text, icdCode: icdCode.trim() || undefined },
            actor,
          )
        : item,
    ),
  }));
}

export function toggleResolvedDiagnosis(
  patientId: string,
  id: string,
  actor: string,
): void {
  const timestamp = now();

  update(patientId, (records) => ({
    ...records,
    diagnoses: records.diagnoses.map((item) => {
      if (item.id !== id) return item;

      if (item.resolved) {
        return {
          ...item,
          resolved: false,
          resolvedBy: undefined,
          resolvedAt: undefined,
          updatedBy: actor,
          updatedAt: timestamp,
        };
      }

      return {
        ...item,
        resolved: true,
        resolvedBy: actor,
        resolvedAt: timestamp,
        updatedBy: actor,
        updatedAt: timestamp,
      };
    }),
  }));
}

export function addOrder(
  patientId: string,
  input: { order: string; status: OrderStatus; department: string },
  actor: string,
): void {
  const timestamp = now();

  const order: Order = {
    id: crypto.randomUUID(),
    date: timestamp,
    order: input.order,
    status: input.status,
    department: input.department,
    createdAt: timestamp,
    createdBy: actor,
  };

  update(patientId, (records) => ({
    ...records,
    orders: [order, ...records.orders],
  }));
}

export function removeOrder(patientId: string, id: string): void {
  update(patientId, (records) => ({
    ...records,
    orders: records.orders.filter((item) => item.id !== id),
  }));
}

function buildFieldAudit(
  values: VitalValues,
  timestamp: string,
  actor: string,
  previous?: VitalReading,
): Partial<Record<VitalFieldKey, FieldAudit>> {
  const audit: Partial<Record<VitalFieldKey, FieldAudit>> = {};

  for (const key of Object.keys(values) as VitalFieldKey[]) {
    const value = (values[key] ?? "").trim();

    if (value === "") continue;

    const prior = previous?.fieldAudit?.[key];
    const unchanged =
      previous !== undefined && (previous[key] ?? "").trim() === value;

    audit[key] =
      unchanged && prior ? prior : { at: timestamp, by: actor };
  }

  return audit;
}

export function addVitalReading(
  patientId: string,
  values: VitalValues,
  actor: string,
  previous?: VitalReading,
): string {
  const timestamp = now();

  const reading: VitalReading = {
    ...values,
    id: crypto.randomUUID(),
    createdAt: timestamp,
    createdBy: actor,
    fieldAudit: buildFieldAudit(values, timestamp, actor, previous),
  };

  update(patientId, (records) => ({
    ...records,
    vitals: [reading, ...records.vitals],
  }));

  return reading.id;
}

export function updateVitalReading(
  patientId: string,
  id: string,
  patch: Partial<VitalValues>,
  actor: string,
): void {
  const timestamp = now();

  update(patientId, (records) => ({
    ...records,
    vitals: records.vitals.map((item) => {
      if (item.id !== id) return item;

      const next = markEdited({ ...item, ...patch }, actor);
      const audit = { ...(item.fieldAudit ?? {}) };

      for (const key of Object.keys(patch) as VitalFieldKey[]) {
        const value = (patch[key] ?? "").trim();

        if (value === "") {
          delete audit[key];
          continue;
        }

        if ((item[key] ?? "").trim() !== value) {
          audit[key] = { at: timestamp, by: actor };
        }
      }

      next.fieldAudit = audit;

      return next;
    }),
  }));
}

export function addMedication(
  patientId: string,
  input: Omit<Medication, "id" | keyof AuditFields>,
  actor: string,
): void {
  const medication: Medication = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now(),
    createdBy: actor,
  };

  update(patientId, (records) => ({
    ...records,
    medications: [medication, ...records.medications],
  }));
}

export function updateMedication(
  patientId: string,
  id: string,
  patch: Partial<Omit<Medication, "id" | keyof AuditFields>>,
  actor: string,
): void {
  update(patientId, (records) => ({
    ...records,
    medications: records.medications.map((item) =>
      item.id === id ? markEdited({ ...item, ...patch }, actor) : item,
    ),
  }));
}

export function removeMedication(patientId: string, id: string): void {
  update(patientId, (records) => ({
    ...records,
    medications: records.medications.filter((item) => item.id !== id),
  }));
}

export function stopMedication(
  patientId: string,
  id: string,
  actor: string,
): void {
  const timestamp = now();

  update(patientId, (records) => ({
    ...records,
    medications: records.medications.map((item) =>
      item.id === id
        ? {
            ...item,
            status: "Stopped" as MedStatus,
            statusBeforeStop: item.status,
            stoppedBy: actor,
            stoppedAt: timestamp,
            updatedBy: actor,
            updatedAt: timestamp,
          }
        : item,
    ),
  }));
}

export function resumeMedication(
  patientId: string,
  id: string,
  actor: string,
): void {
  update(patientId, (records) => ({
    ...records,
    medications: records.medications.map((item) =>
      item.id === id
        ? {
            ...item,
            status: item.statusBeforeStop ?? ("Prescribed" as MedStatus),
            statusBeforeStop: undefined,
            stoppedBy: undefined,
            stoppedAt: undefined,
            updatedBy: actor,
            updatedAt: now(),
          }
        : item,
    ),
  }));
}

export function toggleHoldMedication(
  patientId: string,
  id: string,
  actor: string,
): void {
  update(patientId, (records) => ({
    ...records,
    medications: records.medications.map((item) =>
      item.id === id
        ? markEdited({ ...item, held: !item.held }, actor)
        : item,
    ),
  }));
}

type AdministrationInput = Omit<
  MedicationAdministration,
  "id" | keyof AuditFields | "medicationId" | "scheduledAt"
>;

export function setMedicationAdministration(
  patientId: string,
  medicationId: string,
  scheduledAt: string,
  input: AdministrationInput,
  actor: string,
): void {
  const timestamp = now();

  update(patientId, (records) => {
    const existing = records.administrations.find(
      (item) =>
        item.medicationId === medicationId && item.scheduledAt === scheduledAt,
    );

    if (existing) {
      return {
        ...records,
        administrations: records.administrations.map((item) =>
          item.id === existing.id
            ? markEdited({ ...item, ...input }, actor)
            : item,
        ),
      };
    }

    const administration: MedicationAdministration = {
      ...input,
      id: crypto.randomUUID(),
      medicationId,
      scheduledAt,
      createdAt: timestamp,
      createdBy: actor,
    };

    return {
      ...records,
      administrations: [administration, ...records.administrations],
    };
  });
}

export function updateMedicationAdministration(
  patientId: string,
  id: string,
  patch: Partial<AdministrationInput>,
  actor: string,
): void {
  update(patientId, (records) => ({
    ...records,
    administrations: records.administrations.map((item) =>
      item.id === id ? markEdited({ ...item, ...patch }, actor) : item,
    ),
  }));
}

export function removeMedicationAdministration(
  patientId: string,
  id: string,
): void {
  update(patientId, (records) => ({
    ...records,
    administrations: records.administrations.filter(
      (item) => item.id !== id,
    ),
  }));
}

export type IoEntryInput = Omit<IoEntry, "id" | keyof AuditFields>;

export function addIoEntry(
  patientId: string,
  input: IoEntryInput,
  actor: string,
): void {
  const entry: IoEntry = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now(),
    createdBy: actor,
  };

  update(patientId, (records) => ({
    ...records,
    ioEntries: [entry, ...records.ioEntries],
  }));
}

export function addIoEntries(
  patientId: string,
  inputs: IoEntryInput[],
  actor: string,
): void {
  const timestamp = now();

  const entries: IoEntry[] = inputs.map((input) => ({
    ...input,
    id: crypto.randomUUID(),
    createdAt: timestamp,
    createdBy: actor,
  }));

  update(patientId, (records) => ({
    ...records,
    ioEntries: [...records.ioEntries, ...entries],
  }));
}

export function updateIoEntry(
  patientId: string,
  id: string,
  patch: Partial<IoEntryInput>,
  actor: string,
): void {
  update(patientId, (records) => ({
    ...records,
    ioEntries: records.ioEntries.map((item) =>
      item.id === id ? markEdited({ ...item, ...patch }, actor) : item,
    ),
  }));
}

export function removeIoEntry(patientId: string, id: string): void {
  update(patientId, (records) => ({
    ...records,
    ioEntries: records.ioEntries.filter((item) => item.id !== id),
  }));
}

export type ProgressNoteInput = Omit<
  ProgressNote,
  "id" | keyof AuditFields | "versions"
>;

export function addProgressNote(
  patientId: string,
  input: ProgressNoteInput,
  actor: string,
): string {
  const timestamp = now();

  const note: ProgressNote = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: timestamp,
    createdBy: actor,
    versions: [
      {
        version: 1,
        author: actor,
        timestamp,
        content: input.content,
        changeSummary: "Initial entry",
      },
    ],
  };

  update(patientId, (records) => ({
    ...records,
    progressNotes: [note, ...records.progressNotes],
  }));

  return note.id;
}

export function updateProgressNoteMeta(
  patientId: string,
  id: string,
  patch: Pick<ProgressNote, "department" | "employeeId" | "noteDate">,
  actor: string,
): void {
  update(patientId, (records) => ({
    ...records,
    progressNotes: records.progressNotes.map((note) =>
      note.id === id ? markEdited({ ...note, ...patch }, actor) : note,
    ),
  }));
}

export function saveProgressNote(
  patientId: string,
  id: string,
  content: string,
  plainText: string,
  actor: string,
  changeSummary?: string,
): void {
  const timestamp = now();

  update(patientId, (records) => ({
    ...records,
    progressNotes: records.progressNotes.map((note) => {
      if (note.id !== id) return note;

      const latestVersion = note.versions[note.versions.length - 1];

      const nextVersion: ProgressNoteVersion = {
        version: (latestVersion?.version ?? 0) + 1,
        author: actor,
        timestamp,
        content,
        changeSummary,
      };

      return {
        ...note,
        content,
        plainText,
        updatedBy: actor,
        updatedAt: timestamp,
        versions: [...note.versions, nextVersion],
      };
    }),
  }));
}

export function finalizeProgressNote(
  patientId: string,
  id: string,
  actor: string,
): void {
  const timestamp = now();

  update(patientId, (records) => ({
    ...records,
    progressNotes: records.progressNotes.map((note) =>
      note.id === id
        ? {
            ...note,
            status: "Finalized",
            updatedBy: actor,
            updatedAt: timestamp,
          }
        : note,
    ),
  }));
}

export function signProgressNote(
  patientId: string,
  id: string,
  actor: string,
  meta: {
    employeeId: string;
    authorizedBy: string;
    ip: string;
    device: string;
  },
): void {
  const timestamp = now();

  update(patientId, (records) => ({
    ...records,
    progressNotes: records.progressNotes.map((note) => {
      if (note.id !== id) return note;

      const latestVersion = note.versions[note.versions.length - 1];

      const signVersion: ProgressNoteVersion = {
        version: (latestVersion?.version ?? 0) + 1,
        author: actor,
        timestamp,
        content: note.content,
        changeSummary: "Electronically signed",
      };

      return {
        ...note,
        status: "Signed",
        signedBy: actor,
        signedAt: timestamp,
        signedEmployeeId: meta.employeeId,
        authorizedBy: meta.authorizedBy,
        signatureIp: meta.ip,
        signatureDevice: meta.device,
        updatedBy: actor,
        updatedAt: timestamp,
        versions: [...note.versions, signVersion],
      };
    }),
  }));
}
