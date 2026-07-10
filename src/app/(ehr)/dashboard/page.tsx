import OPDSummary from "@/components/dashboard/OPDSummary";
import IPDSummary from "@/components/dashboard/IPDSummary";
import CalendarCard from "@/components/dashboard/CalendarCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      <OPDSummary />

      <IPDSummary />

      <CalendarCard />

    </div>
  );
}