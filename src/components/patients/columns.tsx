"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

import PatientStatusBadge from "./PatientStatusBadge";

import { Patient } from "@/types/patient";

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "uhid",
    header: "UHID",
  },

  {
    accessorKey: "name",
    header: "Patient",

    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-[#2b0b08]">
          {row.original.name}
        </p>

        <p className="text-sm text-[#87565b]">
          {row.original.age} Years • {row.original.gender}
        </p>
      </div>
    ),
  },

  {
    accessorKey: "patientType",
    header: "Type",
  },

  {
    accessorKey: "ward",
    header: "Ward",

    cell: ({ row }) => (
      <>
        {row.original.ward}

        {row.original.bed !== "-" &&
          ` • ${row.original.bed}`}
      </>
    ),
  },

  {
    accessorKey: "consultant",
    header: "Consultant",
  },

  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
  },

  {
    accessorKey: "status",
    header: "Status",

    cell: ({ row }) => (
      <PatientStatusBadge
        status={row.original.status}
      />
    ),
  },

  {
    accessorKey: "updated",
    header: "Updated",
  },

  {
    id: "actions",
    header: "",

    cell: () => (
      <div className="flex justify-end gap-2">
        <Button
          size="icon"
          variant="ghost"
        >
          <Eye className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];