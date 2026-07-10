import PatientsHeader from "@/components/patients/PatientsHeader";
import PatientsStats from "@/components/patients/PatientsStats";
import PatientsFilters from "@/components/patients/PatientsFilters";
import PatientsTable from "@/components/patients/PatientsTable";

export default function PatientsPage() {
  return (
    <div className="space-y-6">

      <PatientsHeader />

      <PatientsStats />

      <PatientsFilters />

      <PatientsTable />

    </div>
  );
}