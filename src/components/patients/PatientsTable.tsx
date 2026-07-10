"use client";

import { DataTable } from "@/components/ui/data-table";

import { columns } from "./columns";
import { patients } from "./data";

export default function PatientsTable() {
  return (
    <DataTable
      columns={columns}
      data={patients}
    />
  );
}