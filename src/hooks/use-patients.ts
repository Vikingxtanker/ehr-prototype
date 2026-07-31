"use client";

import { useSyncExternalStore } from "react";

import {
  getPatientsSnapshot,
  subscribePatients,
} from "@/lib/patients/store";
import type { Patient } from "@/lib/types/patient";

export function usePatients(): Patient[] {
  return useSyncExternalStore(
    subscribePatients,
    getPatientsSnapshot,
    getPatientsSnapshot,
  );
}

export function usePatient(id: string | undefined): Patient | undefined {
  const patients = usePatients();

  if (!id) return undefined;

  return patients.find((patient) => patient.id === id);
}
