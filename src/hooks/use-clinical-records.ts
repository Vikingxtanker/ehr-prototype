"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  getClinicalRecordsSnapshot,
  hydrateClinicalRecords,
  subscribeClinicalRecords,
  type ClinicalRecords,
} from "@/lib/patients/clinical-store";

export function useClinicalRecords(patientId: string): ClinicalRecords {
  useEffect(() => {
    hydrateClinicalRecords(patientId);
  }, [patientId]);

  return useSyncExternalStore(
    subscribeClinicalRecords,
    () => getClinicalRecordsSnapshot(patientId),
    () => getClinicalRecordsSnapshot(patientId),
  );
}
