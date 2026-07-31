import type {
  AdmissionType,
  BloodGroup,
  Gender,
  MaritalStatus,
  PatientStatus,
  Ward,
} from "@/lib/constants/patient";

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Admission {
  type: AdmissionType;
  ward: Ward;
  bedNumber: string;
  consultantName: string;
  diagnosis: string;
  status: PatientStatus;
  admittedAt: string;
  notes: string;
}

export interface Patient {
  id: string;
  uhid: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup: BloodGroup;
  maritalStatus: MaritalStatus;
  occupation: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContact: EmergencyContact;
  allergies: string[];
  currentMedications: string[];
  chronicConditions: string[];
  chiefComplaint: string;
  admission: Admission | null;
  createdAt: string;
}

export type NewPatientInput = Omit<Patient, "id" | "uhid" | "createdAt">;

export function getPatientFullName(patient: Pick<Patient, "firstName" | "lastName">): string {
  return `${patient.firstName} ${patient.lastName}`.trim();
}
