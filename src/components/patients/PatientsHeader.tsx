"use client";

import { Download, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PatientsHeader() {
  return (
    <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

      {/* Left */}

      <div>

        <h1 className="text-3xl font-bold tracking-tight text-[#2b0b08]">
          Patients
        </h1>

        <p className="mt-1 text-[#87565b]">
          Manage patient registrations, admissions, consultations, and
          discharge records.
        </p>

      </div>

      {/* Right */}

      <div className="flex flex-wrap items-center gap-3">

        <Button
          variant="outline"
          className="
            border-[#ddc5c7]
            bg-white
            text-[#4c1711]
            hover:bg-[#fcfaf9]
          "
        >
          <Download className="mr-2 h-4 w-4" />

          Export

        </Button>

        <Button
          variant="anexra"
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />

          Register Patient

        </Button>

      </div>

    </section>
  );
}