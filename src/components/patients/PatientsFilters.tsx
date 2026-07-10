"use client";

import { Filter, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PatientsFilters() {
  return (
    <section
      className="
        rounded-3xl
        border
        border-[#ece1e2]
        bg-white
        p-5
        shadow-sm
      "
    >
      <div className="flex flex-col gap-4">

        {/* Search */}

        <div className="relative">

          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9d8f91]" />

          <Input
            placeholder="Search by UHID, Patient Name, Phone Number..."
            className="
              h-12
              rounded-2xl
              border-[#ddc5c7]
              bg-[#fcfaf9]
              pl-11
              focus-visible:ring-[#87565b]
            "
          />

        </div>

        {/* Filters */}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">

          <Select>
            <SelectTrigger className="h-11 rounded-2xl">
              <SelectValue placeholder="Patient Type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="opd">OPD</SelectItem>
              <SelectItem value="ipd">IPD</SelectItem>
              <SelectItem value="er">Emergency</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="h-11 rounded-2xl">
              <SelectValue placeholder="Department" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="medicine">General Medicine</SelectItem>
              <SelectItem value="surgery">General Surgery</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="orthopedics">Orthopedics</SelectItem>
              <SelectItem value="icu">ICU</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="h-11 rounded-2xl">
              <SelectValue placeholder="Ward" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Wards</SelectItem>
              <SelectItem value="icu">ICU</SelectItem>
              <SelectItem value="ward1">Ward A</SelectItem>
              <SelectItem value="ward2">Ward B</SelectItem>
              <SelectItem value="ward3">Ward C</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="h-11 rounded-2xl">
              <SelectValue placeholder="Consultant" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Consultants</SelectItem>
              <SelectItem value="patil">Dr. Patil</SelectItem>
              <SelectItem value="shah">Dr. Shah</SelectItem>
              <SelectItem value="joshi">Dr. Joshi</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="h-11 rounded-2xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="stable">Stable</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="observation">Observation</SelectItem>
              <SelectItem value="discharged">Discharged</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="
              h-11
              rounded-2xl
              border-[#ddc5c7]
              hover:bg-[#fcfaf9]
            "
          >
            <Filter className="mr-2 h-4 w-4" />

            More Filters

          </Button>

        </div>

      </div>
    </section>
  );
}