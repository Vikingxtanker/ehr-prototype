import {
  Activity,
  BedDouble,
  Hospital,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Total Patients",
    value: "1,248",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "OPD Today",
    value: "84",
    icon: Stethoscope,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "IPD Patients",
    value: "216",
    icon: BedDouble,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "ICU Occupancy",
    value: "18",
    icon: Hospital,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    title: "Admissions",
    value: "23",
    icon: UserPlus,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    title: "Discharges",
    value: "15",
    icon: Activity,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

export default function PatientsStats() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="
              rounded-3xl
              border
              border-[#ece1e2]
              bg-white
              p-5
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-lg
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#87565b]">
                  {stat.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#2b0b08]">
                  {stat.value}
                </h2>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconBg}`}
              >
                <Icon
                  className={`h-6 w-6 ${stat.iconColor}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}