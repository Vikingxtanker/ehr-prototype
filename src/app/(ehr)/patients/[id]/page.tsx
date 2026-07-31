"use client";

import { use } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  HeartPulse,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/patients/status-badge";

import {
  ADMISSION_TYPE_LABELS,
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
} from "@/lib/constants/patient";
import { getAge } from "@/lib/patients/format";
import { usePatient } from "@/hooks/use-patients";
import { getPatientFullName } from "@/lib/types/patient";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-[#9d8f91] uppercase">
        {label}
      </dt>

      <dd className="mt-0.5 text-sm font-medium text-[#2b0b08]">
        {value || "\u2014"}
      </dd>
    </div>
  );
}

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#ece1e2] bg-white p-6 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-[#2b0b08]">
        {icon}

        {title}
      </h2>

      <dl className="grid gap-5 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const patient = usePatient(id);

  if (!patient) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-[#2b0b08]">
          Patient not found
        </h1>

        <p className="text-sm text-[#87565b]">
          The patient record could not be found. This can happen after a page
          refresh, because patient data currently lives in memory only.
        </p>

        <Button variant="anexra" asChild>
          <Link href="/patients">
            <ArrowLeft />

            Back to Patients
          </Link>
        </Button>
      </div>
    );
  }

  const age = getAge(patient.dateOfBirth);

  const initials = `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase();

  const address = [patient.addressLine, patient.city, patient.state].filter(Boolean).join(", ");

  return (
    <div className="space-y-8">
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 mb-4 text-[#87565b]"
        >
          <Link href="/patients">
            <ArrowLeft />

            Back to Patients
          </Link>
        </Button>
      </div>

      {/* Patient header */}
      <div className="flex flex-wrap items-center gap-6 rounded-3xl border border-[#ece1e2] bg-white p-6 shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6a2f33] to-[#4c1711] text-2xl font-bold text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-[#2b0b08]">
              {getPatientFullName(patient)}
            </h1>

            {patient.admission ? (
              <StatusBadge status={patient.admission.status} />
            ) : (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Registered
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#87565b]">
            <span className="font-medium text-[#4c1711]">
              {patient.uhid}
            </span>

            <span>
              {age !== null ? `${age} years` : "Age unknown"} •{" "}
              {GENDER_LABELS[patient.gender]}
            </span>

            <span>Blood Group {patient.bloodGroup}</span>

            <span>Registered {format(new Date(patient.createdAt), "dd MMM yyyy")}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <DetailSection title="Demographics" icon={<UserRound className="h-5 w-5 text-[#4c1711]" />}>
            <DetailRow label="Date of Birth" value={`${format(new Date(patient.dateOfBirth), "dd MMM yyyy")}${age !== null ? ` (${age} yrs)` : ""}`} />

            <DetailRow label="Gender" value={GENDER_LABELS[patient.gender]} />

            <DetailRow label="Blood Group" value={patient.bloodGroup} />

            <DetailRow label="Marital Status" value={MARITAL_STATUS_LABELS[patient.maritalStatus]} />

            <DetailRow label="Occupation" value={patient.occupation} />

            <DetailRow label="Chief Complaint" value={patient.chiefComplaint} />
          </DetailSection>

          <DetailSection title="Contact" icon={<Phone className="h-5 w-5 text-[#4c1711]" />}>
            <DetailRow label="Mobile Number" value={patient.phone} />

            <DetailRow label="Email Address" value={patient.email} />

            <DetailRow label="Address" value={address} />

            <DetailRow label="PIN Code" value={patient.pincode} />
          </DetailSection>

          <DetailSection title="Medical History" icon={<HeartPulse className="h-5 w-5 text-[#4c1711]" />}>
            <DetailRow label="Allergies" value={patient.allergies.length ? patient.allergies.join(", ") : "No known allergies"} />

            <DetailRow label="Current Medications" value={patient.currentMedications.length ? patient.currentMedications.join(", ") : "None"} />

            <DetailRow label="Chronic Conditions" value={patient.chronicConditions.length ? patient.chronicConditions.join(", ") : "None"} />

            <DetailRow label="Emergency Contact" value={`${patient.emergencyContact.name} (${patient.emergencyContact.relationship}) - ${patient.emergencyContact.phone}`} />
          </DetailSection>
        </div>

        {/* Admission summary */}
        <div className="space-y-8">
          <DetailSection title="IPD Admission" icon={<BedDouble className="h-5 w-5 text-[#4c1711]" />}>
            {patient.admission ? (
              <>
                <DetailRow label="Admission Type" value={ADMISSION_TYPE_LABELS[patient.admission.type]} />

                <DetailRow label="Ward / Bed" value={`${patient.admission.ward} / Bed ${patient.admission.bedNumber}`} />

                <DetailRow label="Consulting Doctor" value={patient.admission.consultantName} />

                <DetailRow label="Provisional Diagnosis" value={patient.admission.diagnosis} />

                <DetailRow label="Status" value={patient.admission.status === "admitted" ? "Admitted" : "—"} />

                <DetailRow label="Admitted On" value={format(new Date(patient.admission.admittedAt), "dd MMM yyyy")} />

                <DetailRow label="Notes" value={patient.admission.notes} />
              </>
            ) : (
              <p className="text-sm text-[#87565b]">
                This patient is not currently admitted to an in-patient ward.
              </p>
            )}
          </DetailSection>

          <div className="flex items-center gap-3 rounded-3xl border border-dashed border-[#ddc5c7] bg-[#fcfaf9] p-6">
            <CalendarDays className="h-5 w-5 shrink-0 text-[#87565b]" />

            <p className="text-sm text-[#87565b]">
              Clinical modules (records, vitals, lab orders) will be added
              here once the backend is connected.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-3xl border border-dashed border-[#ddc5c7] bg-[#fcfaf9] p-6">
            <MapPin className="h-5 w-5 shrink-0 text-[#87565b]" />

            <p className="text-sm text-[#87565b]">
              {patient.admission
                ? `${patient.admission.ward}, Bed ${patient.admission.bedNumber}`
                : "Not admitted"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
