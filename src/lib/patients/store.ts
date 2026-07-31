"use client";

import { toast } from "sonner";

import type { NewPatientInput, Patient } from "@/lib/types/patient";
import { createClient } from "@/lib/supabase/client";

/**
 * Supabase-backed patient store.
 *
 * Keeps an in-memory cache so the existing `useSyncExternalStore` UI keeps
 * working unchanged. The cache is hydrated once from the `patients` table,
 * and every mutation is applied optimistically and then persisted.
 */

let patients: Patient[] = [];
let initialized = false;
let loadPromise: Promise<void> | null = null;

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) listener();
}

export function subscribePatients(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getPatientsSnapshot(): Patient[] {
  return patients;
}

export function getPatient(id: string): Patient | undefined {
  return patients.find((patient) => patient.id === id);
}

function generateUhid(): string {
  const year = new Date().getFullYear();
  const nextNumber = patients.length + 1;

  return `AHI-${year}-${String(nextNumber).padStart(4, "0")}`;
}

export function hydratePatients(): Promise<void> {
  if (initialized) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("patients")
        .select("id, data")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rows = (data ?? []) as Array<{ id: string; data: unknown }>;

      patients = rows
        .map((row) => row.data as Patient)
        .filter(
          (patient): patient is Patient =>
            Boolean(patient) && typeof patient.id === "string",
        );

      initialized = true;

      emitChange();
    } catch (error) {
      console.error(error);

      toast.error("Could not load patients from the cloud.");
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export async function addPatient(input: NewPatientInput): Promise<Patient> {
  const patient: Patient = {
    ...input,
    id: crypto.randomUUID(),
    uhid: generateUhid(),
    createdAt: new Date().toISOString(),
  };

  patients = [patient, ...patients];

  emitChange();

  try {
    const supabase = createClient();

    const { error } = await supabase.from("patients").insert({
      id: patient.id,
      data: patient,
      created_at: patient.createdAt,
    });

    if (error) throw error;
  } catch (error) {
    console.error(error);

    toast.error(
      "Could not sync the patient to the cloud. The record will be lost on refresh.",
    );
  }

  return patient;
}
