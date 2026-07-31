"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  getPatientsSnapshot,
  hydratePatients,
  subscribePatients,
} from "@/lib/patients/store";
import type { Patient } from "@/lib/types/patient";

export function usePatients(): Patient[] {
  useEffect(() => {
    hydratePatients();
  }, []);

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
