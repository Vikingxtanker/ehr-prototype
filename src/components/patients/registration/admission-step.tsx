"use client";

import { useEffect } from "react";

import { useFormContext, useWatch } from "react-hook-form";

import {
  ADMISSION_TYPES,
  ADMISSION_TYPE_LABELS,
  PATIENT_STATUSES,
  STATUS_LABELS,
  WARDS,
} from "@/lib/constants/patient";

import { CheckboxField, SelectField, TextareaField, TextField } from "./form-field";

const ADMISSION_FIELDS = [
  "admissionType",
  "ward",
  "bedNumber",
  "consultantName",
  "diagnosis",
  "status",
  "admittedAt",
  "notes",
];

export function AdmissionStep() {
  const admitToIpd = useWatch({ name: "admitToIpd" });

  const { clearErrors } = useFormContext();

  useEffect(() => {
    if (!admitToIpd) {
      clearErrors(ADMISSION_FIELDS);
    }
  }, [admitToIpd, clearErrors]);

  return (
    <div className="space-y-6">
      <CheckboxField
        name="admitToIpd"
        label="Admit to IPD"
        description="Check to admit this patient to an in-patient ward. Uncheck to register the patient without admission."
      >
        {!admitToIpd && (
          <p className="text-sm font-medium text-amber-700">
            Admission details will be skipped. The patient will appear in the
            patient list but not under IPD.
          </p>
        )}
      </CheckboxField>

      <div
        className={
          admitToIpd
            ? "space-y-6"
            : "pointer-events-none space-y-6 opacity-50"
        }
      >
        <section className="space-y-4">
          <h3 className="font-semibold text-[#2b0b08]">Ward Assignment</h3>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
              name="admissionType"
              label="Admission Type"
              required
              options={ADMISSION_TYPES.map((value) => ({
                value,
                label: ADMISSION_TYPE_LABELS[value],
              }))}
            />

            <SelectField
              name="ward"
              label="Ward"
              required
              options={WARDS.map((value) => ({ value, label: value }))}
            />

            <TextField
              name="bedNumber"
              label="Bed Number"
              placeholder="e.g. 12"
              required
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold text-[#2b0b08]">Clinical Details</h3>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TextField
              name="consultantName"
              label="Consulting Doctor"
              placeholder="e.g. Dr. Rajesh Shah"
              required
            />

            <TextField
              name="diagnosis"
              label="Provisional Diagnosis"
              placeholder="e.g. Pneumonia"
              required
            />

            <SelectField
              name="status"
              label="Patient Status"
              required
              options={PATIENT_STATUSES.map((value) => ({
                value,
                label: STATUS_LABELS[value],
              }))}
            />

            <TextField
              name="admittedAt"
              label="Admission Date"
              type="date"
              required
            />

            <TextareaField
              name="notes"
              label="Admission Notes"
              placeholder="Any additional notes for the admitting team"
              className="sm:col-span-2"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
