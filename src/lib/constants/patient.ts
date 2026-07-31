export const GENDERS = ["male", "female", "other"] as const;
export type Gender = (typeof GENDERS)[number];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const MARITAL_STATUSES = ["single", "married", "divorced", "widowed"] as const;
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

export const RELATIONSHIPS = [
  "Father",
  "Mother",
  "Spouse",
  "Son",
  "Daughter",
  "Sibling",
  "Friend",
  "Guardian",
  "Other",
] as const;
export type Relationship = (typeof RELATIONSHIPS)[number];

export const ADMISSION_TYPES = ["emergency", "elective", "transfer"] as const;
export type AdmissionType = (typeof ADMISSION_TYPES)[number];

export const PATIENT_STATUSES = [
  "admitted",
  "stable",
  "critical",
  "observation",
  "recovering",
  "discharged",
] as const;
export type PatientStatus = (typeof PATIENT_STATUSES)[number];

export const WARDS = [
  "ICU",
  "Emergency",
  "General Ward",
  "Surgical Ward",
  "Maternity Ward",
  "Paediatrics Ward",
  "Private Room A",
  "Private Room B",
] as const;
export type Ward = (typeof WARDS)[number];

export const STATUS_LABELS: Record<PatientStatus, string> = {
  admitted: "Admitted",
  stable: "Stable",
  critical: "Critical",
  observation: "Observation",
  recovering: "Recovering",
  discharged: "Discharged",
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  single: "Single",
  married: "Married",
  divorced: "Divorced",
  widowed: "Widowed",
};

export const ADMISSION_TYPE_LABELS: Record<AdmissionType, string> = {
  emergency: "Emergency",
  elective: "Elective",
  transfer: "Transfer",
};
