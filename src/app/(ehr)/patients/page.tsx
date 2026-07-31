"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import { BedDouble, HeartPulse, Search, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PatientTable } from "@/components/patients/patient-table";

import {
  PATIENT_STATUSES,
  STATUS_LABELS,
  type PatientStatus,
} from "@/lib/constants/patient";
import { usePatients } from "@/hooks/use-patients";
import { cn } from "@/lib/utils";

type Scope = "all" | "ipd";

export default function PatientsPage() {
  const patients = usePatients();

  const [scope, setScope] = useState<Scope>("ipd");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PatientStatus>("all");

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();

    return patients.filter((patient) => {
      if (scope === "ipd" && !patient.admission) return false;

      if (
        statusFilter !== "all" &&
        patient.admission?.status !== statusFilter
      ) {
        return false;
      }

      if (!q) return true;

      const fullName =
        `${patient.firstName} ${patient.lastName}`.toLowerCase();

      const diagnosis =
        patient.admission?.diagnosis?.toLowerCase() ?? "";

      return (
        fullName.includes(q) ||
        patient.uhid.toLowerCase().includes(q) ||
        diagnosis.includes(q)
      );
    });
  }, [patients, scope, query, statusFilter]);

  const ipdPatients = patients.filter(
    (patient) => patient.admission !== null,
  );

  const criticalPatients = ipdPatients.filter(
    (patient) => patient.admission?.status === "critical",
  );

  const admittedToday = ipdPatients.filter((patient) => {
    const today = new Date().toISOString().slice(0, 10);

    return patient.admission?.admittedAt === today;
  });

  const hasResults = filteredPatients.length > 0;

  const scopeFilter = (
    <div className="flex rounded-2xl border border-[#ece1e2] bg-white p-1">
      <button
        type="button"
        onClick={() => setScope("ipd")}
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
          scope === "ipd"
            ? "bg-gradient-to-br from-[#6a2f33] to-[#4c1711] text-white shadow-md"
            : "text-[#5e5254] hover:bg-[#f7f3f3]",
        )}
      >
        <BedDouble className="h-4 w-4" />

        IPD Patients
      </button>

      <button
        type="button"
        onClick={() => setScope("all")}
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
          scope === "all"
            ? "bg-gradient-to-br from-[#6a2f33] to-[#4c1711] text-white shadow-md"
            : "text-[#5e5254] hover:bg-[#f7f3f3]",
        )}
      >
        <Users className="h-4 w-4" />

        All Patients
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2b0b08]">
            {scope === "ipd" ? "My IPD Patients" : "All Patients"}
          </h1>

          <p className="mt-1 text-sm text-[#87565b]">
            {scope === "ipd"
              ? "Patients currently admitted under in-patient care"
              : "All registered patients in the system"}
          </p>
        </div>

        <Button variant="anexra" size="xl" asChild>
          <Link href="/patients/new">
            <UserPlus />

            Register New Patient
          </Link>
        </Button>
      </div>

      {/* Summary stats (computed from live data) */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Admitted (IPD)",
            value: ipdPatients.length,
            icon: BedDouble,
            color: "text-[#4c1711]",
          },
          {
            label: "Critical",
            value: criticalPatients.length,
            icon: HeartPulse,
            color: "text-red-600",
          },
          {
            label: "Admitted Today",
            value: admittedToday.length,
            icon: UserPlus,
            color: "text-blue-600",
          },
          {
            label: "Total Registered",
            value: patients.length,
            icon: Users,
            color: "text-green-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-3xl border border-[#ece1e2] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#87565b]">{stat.label}</p>

                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>

              <p className="mt-2 text-3xl font-bold text-[#2b0b08]">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {scopeFilter}

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9d8f91]" />

            <Input
              placeholder="Search name, UHID, diagnosis..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-72 rounded-xl border-[#ece1e2] bg-white pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | PatientStatus)
            }
          >
            <SelectTrigger className="h-10 w-40 rounded-xl border-[#ece1e2] bg-white">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>

              {PATIENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="overflow-hidden rounded-3xl border border-[#ece1e2] bg-white shadow-sm">
        {hasResults ? (
          <>
            <div className="border-b border-[#f1ecec] px-6 py-4">
              <p className="text-sm text-[#87565b]">
                {filteredPatients.length}{" "}
                {filteredPatients.length === 1
                  ? "patient"
                  : "patients"}
              </p>
            </div>

            <PatientTable patients={filteredPatients} />
          </>
        ) : (
          <Empty className="min-h-80">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>

              <EmptyTitle>
                {patients.length === 0
                  ? "No patients yet"
                  : "No matching patients"}
              </EmptyTitle>
            </EmptyHeader>

            <EmptyContent>
              <EmptyDescription>
                {patients.length === 0
                  ? "Register your first patient to start building the IPD roster. Patient data is saved to the cloud and persists across sessions."
                  : "Try adjusting your search or filters."}
              </EmptyDescription>
            </EmptyContent>

            {patients.length === 0 && (
              <Button variant="anexra" size="xl" asChild>
                <Link href="/patients/new">
                  <UserPlus />

                  Register New Patient
                </Link>
              </Button>
            )}
          </Empty>
        )}
      </div>
    </div>
  );
}
