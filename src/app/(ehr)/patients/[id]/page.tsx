"use client";

import { use, useState } from "react";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PATIENT_TABS,
  PatientModulePlaceholder,
  PatientTabs,
} from "@/components/patients/patient-tabs";
import {
  PatientActionButtons,
  PatientBanner,
  PatientSummary,
} from "@/components/patients/summary";
import { usePatient } from "@/hooks/use-patients";
import { VitalsCharting } from "@/components/patients/vitals";
import { MarChart } from "@/components/patients/mar";

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [activeTab, setActiveTab] = useState("summary");

  const patient = usePatient(id);

  if (!patient) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-[#2b0b08]">
          Patient not found
        </h1>

        <p className="text-sm text-[#87565b]">
          The patient record could not be found. It may have been removed, or
          the data may still be loading.
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

  const activeTabConfig =
    PATIENT_TABS.find((tab) => tab.id === activeTab) ?? PATIENT_TABS[0];

  return (
    <div className="space-y-4">
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 text-[#87565b]"
        >
          <Link href="/patients">
            <ArrowLeft />

            Back to Patients
          </Link>
        </Button>
      </div>

      {/* Patient information banner */}
      <PatientBanner patient={patient} />

      {/* Patient action buttons */}
      <PatientActionButtons onNavigate={setActiveTab} />

      {/* Patient tabs */}
      <PatientTabs active={activeTab} onChange={setActiveTab} />

      {/* Content */}
      {activeTab === "summary" ? (
        <PatientSummary patient={patient} />
      ) : activeTab === "vitals" ? (
        <VitalsCharting patient={patient} />
      ) : activeTab === "mar" ? (
        <MarChart patient={patient} />
      ) : (
        <PatientModulePlaceholder tab={activeTabConfig} />
      )}
    </div>
  );
}
