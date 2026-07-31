"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { GENDER_LABELS } from "@/lib/constants/patient";
import { getAge } from "@/lib/patients/format";
import {
  getPatientFullName,
  type Patient,
} from "@/lib/types/patient";

import { StatusBadge } from "./status-badge";

export function PatientTable({ patients }: { patients: Patient[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#f7f3f3] hover:bg-[#f7f3f3]">
          <TableHead className="rounded-tl-2xl">UHID</TableHead>

          <TableHead>Patient</TableHead>

          <TableHead>Ward / Bed</TableHead>

          <TableHead>Consultant</TableHead>

          <TableHead>Diagnosis</TableHead>

          <TableHead>Status</TableHead>

          <TableHead className="rounded-tr-2xl text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {patients.map((patient) => {
          const age = getAge(patient.dateOfBirth);

          return (
            <TableRow key={patient.id}>
              <TableCell className="py-4 font-medium text-[#4c1711]">
                {patient.uhid}
              </TableCell>

              <TableCell className="py-4">
                <p className="font-semibold text-[#2b0b08]">
                  {getPatientFullName(patient)}
                </p>

                <p className="text-xs text-[#9d8f91]">
                  {age !== null ? `${age} yrs` : "Age unknown"} •{" "}
                  {GENDER_LABELS[patient.gender]}
                </p>
              </TableCell>

              <TableCell className="py-4">
                {patient.admission
                  ? `${patient.admission.ward} / Bed ${patient.admission.bedNumber}`
                  : "Not admitted"}
              </TableCell>

              <TableCell className="py-4">
                {patient.admission?.consultantName ?? "—"}
              </TableCell>

              <TableCell className="max-w-56 truncate py-4">
                {patient.admission?.diagnosis || patient.chiefComplaint || "—"}
              </TableCell>

              <TableCell className="py-4">
                {patient.admission ? (
                  <StatusBadge status={patient.admission.status} />
                ) : (
                  <span className="text-xs font-medium text-[#9d8f91]">
                    Registered
                  </span>
                )}
              </TableCell>

              <TableCell className="py-4 text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/patients/${patient.id}`}>
                    <Eye />

                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
