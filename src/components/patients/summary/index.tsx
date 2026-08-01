"use client";

import type { Patient } from "@/lib/types/patient";

import { ComplaintsCard } from "./complaints-card";
import { DiagnosisCard } from "./diagnosis-card";
import { MedicationTable } from "./medication-table";
import { OrdersCard } from "./orders-card";
import { PatientActionButtons, PatientBanner } from "./patient-banner";
import { StoppedMedicationsCard } from "./stopped-medications-card";
import { VitalsCard } from "./vitals-card";

export { PatientActionButtons, PatientBanner };

export function PatientSummary({
  patient,
}: {
  patient: Patient;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ComplaintsCard patient={patient} className="h-full" />

        <DiagnosisCard patient={patient} className="h-full" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <OrdersCard patient={patient} className="h-[360px]" />

        <VitalsCard patient={patient} className="h-[360px]" />
      </div>

      <MedicationTable patient={patient} />

      <StoppedMedicationsCard patient={patient} />
    </div>
  );
}
