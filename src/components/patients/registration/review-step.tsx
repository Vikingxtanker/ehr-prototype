"use client";

import type { ReactNode } from "react";

import { useFormContext } from "react-hook-form";

import {
  ADMISSION_TYPE_LABELS,
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  STATUS_LABELS,
} from "@/lib/constants/patient";
import { getAge, parseList } from "@/lib/patients/format";
import { format } from "date-fns";
import type { PatientFormValues } from "@/lib/validations/patient-schema";

function Row({
  label,
  value,
  className,
}: {
  label: string;
  value: string | undefined;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium tracking-wide text-[#9d8f91] uppercase">
        {label}
      </dt>

      <dd className="mt-0.5 text-sm font-medium text-[#2b0b08]">
        {value || "\u2014"}
      </dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#ece1e2] bg-white p-6">
      <h3 className="mb-5 text-sm font-semibold tracking-wide text-[#4c1711] uppercase">
        {title}
      </h3>

      <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </dl>
    </section>
  );
}

function joinList(values: string | undefined, emptyLabel = "None") {
  const items = parseList(values ?? "");

  return items.length > 0 ? items.join(", ") : emptyLabel;
}

export function ReviewStep() {
  const { watch } = useFormContext<PatientFormValues>();

  const values = watch();

  const fullName = `${values.firstName} ${values.lastName}`.trim();

  const age = getAge(values.dateOfBirth);

  const address = [values.addressLine, values.city, values.state].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      <Section title="Patient Details">
        <Row label="Full Name" value={fullName} />

        <Row
          label="Date of Birth"
          value={
            values.dateOfBirth
              ? `${format(new Date(values.dateOfBirth), "dd MMM yyyy")}${age !== null ? ` (${age} yrs)` : ""}`
              : ""
          }
        />

        <Row label="Gender" value={GENDER_LABELS[values.gender]} />

        <Row label="Blood Group" value={values.bloodGroup} />

        <Row
          label="Marital Status"
          value={MARITAL_STATUS_LABELS[values.maritalStatus]}
        />

        <Row label="Occupation" value={values.occupation} />
      </Section>

      <Section title="Contact Information">
        <Row label="Mobile Number" value={values.phone} />

        <Row label="Email Address" value={values.email} />

        <Row label="Address" value={address} />

        <Row label="PIN Code" value={values.pincode} />
      </Section>

      <Section title="Emergency Contact">
        <Row label="Name" value={values.emergencyContactName} />

        <Row
          label="Relationship"
          value={values.emergencyContactRelationship}
        />

        <Row label="Phone" value={values.emergencyContactPhone} />
      </Section>

      <Section title="Medical History">
        <Row label="Allergies" value={joinList(values.allergies, "No known allergies")} />

        <Row label="Current Medications" value={joinList(values.currentMedications)} />

        <Row label="Chronic Conditions" value={joinList(values.chronicConditions)} />

        <Row
          label="Chief Complaint"
          value={values.chiefComplaint}
          className="lg:col-span-2"
        />
      </Section>

      {values.admitToIpd ? (
        <Section title="IPD Admission">
          <Row
            label="Admission Type"
            value={ADMISSION_TYPE_LABELS[values.admissionType]}
          />

          <Row
            label="Ward / Bed"
            value={
              values.ward
                ? `${values.ward}${values.bedNumber ? ` - Bed ${values.bedNumber}` : ""}`
                : ""
            }
          />

          <Row label="Consulting Doctor" value={values.consultantName} />

          <Row label="Provisional Diagnosis" value={values.diagnosis} />

          <Row label="Status" value={STATUS_LABELS[values.status]} />

          <Row
            label="Admission Date"
            value={
              values.admittedAt
                ? format(new Date(values.admittedAt), "dd MMM yyyy")
                : ""
            }
          />

          <Row
            label="Admission Notes"
            value={values.notes}
            className="lg:col-span-2"
          />
        </Section>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#ddc5c7] bg-[#fcfaf9] p-6 text-sm text-[#87565b]">
          This patient is being registered without an IPD admission.
        </div>
      )}
    </div>
  );
}
