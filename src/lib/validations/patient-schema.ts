import { z } from "zod";

import {
  ADMISSION_TYPES,
  BLOOD_GROUPS,
  GENDERS,
  MARITAL_STATUSES,
  PATIENT_STATUSES,
  WARDS,
} from "@/lib/constants/patient";

const optionalString = z.string().trim().optional();

const optionalEmail = z.union([
  z.string().trim().email("Enter a valid email address"),
  z.literal(""),
]);

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number");

const dateOfBirth = z
  .string()
  .min(1, "Date of birth is required")
  .refine(
    (value) => {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) return false;

      return date.getTime() <= Date.now();
    },
    "Enter a valid date of birth",
  );

export const personalSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(60, "First name is too long"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(60, "Last name is too long"),
  dateOfBirth,
  gender: z.enum(GENDERS),
  bloodGroup: z.enum(BLOOD_GROUPS),
  maritalStatus: z.enum(MARITAL_STATUSES),
  occupation: optionalString,
});

export const contactSchema = z.object({
  phone,
  email: optionalEmail,
  addressLine: z
    .string()
    .trim()
    .min(1, "Address is required")
    .max(200, "Address is too long"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  pincode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
  emergencyContactName: z
    .string()
    .trim()
    .min(1, "Emergency contact name is required"),
  emergencyContactRelationship: z
    .string()
    .trim()
    .min(1, "Relationship is required"),
  emergencyContactPhone: phone,
});

export const medicalSchema = z.object({
  allergies: optionalString,
  currentMedications: optionalString,
  chronicConditions: optionalString,
  chiefComplaint: z
    .string()
    .trim()
    .min(1, "Chief complaint is required")
    .max(500, "Chief complaint is too long"),
});

export const admissionSchema = z.object({
  admitToIpd: z.boolean(),
  admissionType: z.enum(ADMISSION_TYPES),
  ward: z.enum(WARDS),
  bedNumber: z.string(),
  consultantName: z.string(),
  diagnosis: z.string(),
  status: z.enum(PATIENT_STATUSES),
  admittedAt: z.string(),
  notes: optionalString,
});

export const patientFormSchema = personalSchema
  .merge(contactSchema)
  .merge(medicalSchema)
  .merge(admissionSchema)
  .superRefine((data, ctx) => {
    if (!data.admitToIpd) return;

    for (const [field, label] of [
      ["bedNumber", "Bed number"],
      ["consultantName", "Consultant name"],
      ["diagnosis", "Provisional diagnosis"],
    ] as const) {
      if (!data[field].trim()) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: `${label} is required`,
        });
      }
    }

    if (!data.admittedAt) {
      ctx.addIssue({
        code: "custom",
        path: ["admittedAt"],
        message: "Admission date is required",
      });
    }
  });

export type PatientFormValues = z.infer<typeof patientFormSchema>;
export type PersonalSchema = z.infer<typeof personalSchema>;
export type ContactSchema = z.infer<typeof contactSchema>;
export type MedicalSchema = z.infer<typeof medicalSchema>;
export type AdmissionSchema = z.infer<typeof admissionSchema>;

export const defaultValues: PatientFormValues = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "male",
  bloodGroup: "Unknown",
  maritalStatus: "single",
  occupation: "",
  phone: "",
  email: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
  allergies: "",
  currentMedications: "",
  chronicConditions: "",
  chiefComplaint: "",
  admitToIpd: true,
  admissionType: "elective",
  ward: "General Ward",
  bedNumber: "",
  consultantName: "",
  diagnosis: "",
  status: "admitted",
  admittedAt: new Date().toISOString().slice(0, 10),
  notes: "",
};
