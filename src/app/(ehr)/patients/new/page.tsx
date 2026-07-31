import type { Metadata } from "next";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { RegistrationWizard } from "@/components/patients/registration/registration-wizard";

export const metadata: Metadata = {
  title: "Register New Patient",
};

export default function NewPatientPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
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

        <h1 className="text-3xl font-bold text-[#2b0b08]">
          Register New Patient
        </h1>

        <p className="mt-1 text-sm text-[#87565b]">
          Complete the steps below to register the patient and optionally
          admit them to an IPD ward.
        </p>
      </div>

      <RegistrationWizard />
    </div>
  );
}
