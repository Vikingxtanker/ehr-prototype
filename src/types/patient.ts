export type PatientStatus =
  | "Stable"
  | "Critical"
  | "Observation"
  | "Surgery"
  | "Consultation"
  | "Discharged";

export interface Patient {
  id: string;

  uhid: string;

  name: string;

  age: number;

  gender: "Male" | "Female" | "Other";

  patientType: "OPD" | "IPD" | "Emergency";

  ward: string;

  bed: string;

  consultant: string;

  diagnosis: string;

  status: PatientStatus;

  updated: string;
}