"use client";

import type { NewPatientInput, Patient } from "@/lib/types/patient";

/**
 * In-memory patient store.
 *
 * Frontend-only development store. Data lives in the browser for the current
 * session and resets on a full page reload.
 *
 * When Supabase is wired up, replace `addPatient` / `getPatientsSnapshot` /
 * `getPatient` with calls to the Supabase client. The subscription API below
 * (or a simple refetch-on-mount) is all the UI relies on.
 */

let patients: Patient[] = [];

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

export function addPatient(input: NewPatientInput): Patient {
  const patient: Patient = {
    ...input,
    id: crypto.randomUUID(),
    uhid: generateUhid(),
    createdAt: new Date().toISOString(),
  };

  patients = [patient, ...patients];

  emitChange();

  return patient;
}
