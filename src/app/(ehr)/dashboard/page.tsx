import {
  Activity,
  BedDouble,
  CalendarDays,
  ClipboardPlus,
  FlaskConical,
  Pill,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Patients Today",
    value: "186",
    icon: Users,
    color: "text-[#4c1711]",
  },
  {
    title: "Admissions",
    value: "24",
    icon: BedDouble,
    color: "text-blue-600",
  },
  {
    title: "OPD Visits",
    value: "41",
    icon: Activity,
    color: "text-green-600",
  },
  {
    title: "Pending Labs",
    value: "18",
    icon: FlaskConical,
    color: "text-amber-600",
  },
  {
    title: "Medication Orders",
    value: "63",
    icon: Pill,
    color: "text-purple-600",
  },
  {
    title: "Discharges",
    value: "12",
    icon: TrendingUp,
    color: "text-emerald-600",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">

      {/* Welcome */}

      <div>

        <h1 className="text-4xl font-bold text-[#2b0b08]">
          Good Morning, Dr. Rajesh Shah 👋
        </h1>

        <p className="mt-2 text-[#87565b]">
          Here's an overview of today's hospital activities.
        </p>

      </div>

      {/* KPI Cards */}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">

        {stats.map((item) => {

          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="
                rounded-3xl
                border
                border-[#ece1e2]
                bg-white
                p-6
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
              "
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-[#87565b]">
                    {item.title}
                  </p>

                  <h2 className="mt-3 text-4xl font-bold text-[#2b0b08]">
                    {item.value}
                  </h2>

                </div>

                <div
                  className="
                    rounded-2xl
                    bg-[#f7f3f3]
                    p-4
                  "
                >
                  <Icon
                    className={`h-7 w-7 ${item.color}`}
                  />
                </div>

              </div>

            </div>
          );

        })}

      </div>

      {/* Quick Actions */}

      <section>

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-2xl font-semibold text-[#2b0b08]">
            Quick Actions
          </h2>

        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

          <button
            className="
              flex
              items-center
              gap-4
              rounded-3xl
              border
              border-[#ece1e2]
              bg-white
              p-6
              transition-all
              hover:-translate-y-1
              hover:border-[#87565b]
              hover:shadow-lg
            "
          >
            <UserPlus className="h-8 w-8 text-[#4c1711]" />

            <div className="text-left">

              <h3 className="font-semibold text-[#2b0b08]">
                Register Patient
              </h3>

              <p className="text-sm text-[#87565b]">
                Add a new patient
              </p>

            </div>

          </button>

          <button
            className="
              flex
              items-center
              gap-4
              rounded-3xl
              border
              border-[#ece1e2]
              bg-white
              p-6
              transition-all
              hover:-translate-y-1
              hover:border-[#87565b]
              hover:shadow-lg
            "
          >
            <CalendarDays className="h-8 w-8 text-[#4c1711]" />

            <div className="text-left">

              <h3 className="font-semibold text-[#2b0b08]">
                Appointment
              </h3>

              <p className="text-sm text-[#87565b]">
                Schedule OPD/IPD
              </p>

            </div>

          </button>

          <button
            className="
              flex
              items-center
              gap-4
              rounded-3xl
              border
              border-[#ece1e2]
              bg-white
              p-6
              transition-all
              hover:-translate-y-1
              hover:border-[#87565b]
              hover:shadow-lg
            "
          >
            <ClipboardPlus className="h-8 w-8 text-[#4c1711]" />

            <div className="text-left">

              <h3 className="font-semibold text-[#2b0b08]">
                New Prescription
              </h3>

              <p className="text-sm text-[#87565b]">
                Create medication order
              </p>

            </div>

          </button>

        </div>

      </section>

            {/* Recent Patients */}

      <section>

        <div className="mb-5 flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-semibold text-[#2b0b08]">
              Recent Patients
            </h2>

            <p className="text-sm text-[#87565b]">
              Patients admitted and currently under care
            </p>

          </div>

          <button
            className="
              rounded-xl
              border
              border-[#ddc5c7]
              bg-white
              px-5
              py-2
              text-sm
              font-medium
              text-[#4c1711]
              transition
              hover:bg-[#f7f3f3]
            "
          >
            View All
          </button>

        </div>

        <div
          className="
            overflow-hidden
            rounded-3xl
            border
            border-[#ece1e2]
            bg-white
            shadow-sm
          "
        >

          <table className="w-full">

            <thead className="bg-[#f7f3f3]">

              <tr className="text-left text-sm text-[#87565b]">

                <th className="px-6 py-4">UHID</th>

                <th className="px-6 py-4">Patient</th>

                <th className="px-6 py-4">Ward</th>

                <th className="px-6 py-4">Consultant</th>

                <th className="px-6 py-4">Diagnosis</th>

                <th className="px-6 py-4">Status</th>

              </tr>

            </thead>

            <tbody>

              {[
                {
                  id: "AH10231",
                  patient: "Rahul Shah",
                  ward: "ICU",
                  doctor: "Dr. Patil",
                  diagnosis: "Pneumonia",
                  status: "Stable",
                },

                {
                  id: "AH10245",
                  patient: "Priya Joshi",
                  ward: "302",
                  doctor: "Dr. Shah",
                  diagnosis: "Dengue",
                  status: "Critical",
                },

                {
                  id: "AH10271",
                  patient: "Amit Kulkarni",
                  ward: "305",
                  doctor: "Dr. Deshmukh",
                  diagnosis: "Appendicitis",
                  status: "Recovering",
                },

                {
                  id: "AH10302",
                  patient: "Sneha Patil",
                  ward: "312",
                  doctor: "Dr. Joshi",
                  diagnosis: "UTI",
                  status: "Stable",
                },

                {
                  id: "AH10318",
                  patient: "Kiran Pawar",
                  ward: "314",
                  doctor: "Dr. More",
                  diagnosis: "AKI",
                  status: "Observation",
                },
              ].map((patient) => (

                <tr
                  key={patient.id}
                  className="
                    border-t
                    border-[#f1ecec]
                    transition
                    hover:bg-[#fcfaf9]
                  "
                >

                  <td className="px-6 py-5 font-medium text-[#4c1711]">

                    {patient.id}

                  </td>

                  <td className="px-6 py-5">

                    <div>

                      <p className="font-semibold text-[#2b0b08]">

                        {patient.patient}

                      </p>

                      <p className="text-sm text-[#9d8f91]">

                        54 Years • Male

                      </p>

                    </div>

                  </td>

                  <td className="px-6 py-5">

                    {patient.ward}

                  </td>

                  <td className="px-6 py-5">

                    {patient.doctor}

                  </td>

                  <td className="px-6 py-5">

                    {patient.diagnosis}

                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold
                        ${
                          patient.status === "Stable"
                            ? "bg-green-100 text-green-700"
                            : patient.status === "Critical"
                            ? "bg-red-100 text-red-700"
                            : patient.status === "Recovering"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }
                      `}
                    >
                      {patient.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

            {/* Alerts & Schedule */}

      <section className="grid gap-6 xl:grid-cols-3">

        {/* Medication Alerts */}

        <div
          className="
            rounded-3xl
            border
            border-[#ece1e2]
            bg-white
            p-6
            shadow-sm
          "
        >

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-xl font-semibold text-[#2b0b08]">
              Medication Alerts
            </h2>

            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
              5 Alerts
            </span>

          </div>

          <div className="space-y-4">

            {[
              {
                patient: "Rahul Shah",
                alert: "Major Drug Interaction",
                color: "bg-red-500",
              },

              {
                patient: "Priya Joshi",
                alert: "Renal Dose Adjustment",
                color: "bg-amber-500",
              },

              {
                patient: "Amit Kulkarni",
                alert: "Duplicate Antibiotic",
                color: "bg-orange-500",
              },

              {
                patient: "Sneha Patil",
                alert: "Allergy Alert",
                color: "bg-pink-500",
              },
            ].map((item) => (

              <div
                key={item.patient}
                className="flex items-center gap-4"
              >

                <div
                  className={`h-3 w-3 rounded-full ${item.color}`}
                />

                <div>

                  <p className="font-medium text-[#2b0b08]">

                    {item.patient}

                  </p>

                  <p className="text-sm text-[#87565b]">

                    {item.alert}

                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Today's Schedule */}

        <div
          className="
            rounded-3xl
            border
            border-[#ece1e2]
            bg-white
            p-6
            shadow-sm
          "
        >

          <h2 className="mb-6 text-xl font-semibold text-[#2b0b08]">

            Today's Schedule

          </h2>

          <div className="space-y-5">

            {[
              ["09:00", "Morning OPD"],
              ["11:00", "Ward Round"],
              ["13:30", "Medication Review"],
              ["15:00", "Clinical Meeting"],
              ["17:00", "Discharge Review"],
            ].map(([time, title]) => (

              <div
                key={time}
                className="flex items-start gap-4"
              >

                <div
                  className="
                    rounded-xl
                    bg-[#f7f3f3]
                    px-3
                    py-2
                    text-sm
                    font-semibold
                    text-[#4c1711]
                  "
                >

                  {time}

                </div>

                <div>

                  <p className="font-medium text-[#2b0b08]">

                    {title}

                  </p>

                  <p className="text-sm text-[#87565b]">

                    Lokmanya Hospital

                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Recent Activity */}

        <div
          className="
            rounded-3xl
            border
            border-[#ece1e2]
            bg-white
            p-6
            shadow-sm
          "
        >

          <h2 className="mb-6 text-xl font-semibold text-[#2b0b08]">

            Recent Activity

          </h2>

          <div className="space-y-5">

            {[
              "Dr. Shah completed Ward Round",
              "Medication Order approved",
              "CBC Report uploaded",
              "Patient admitted to ICU",
              "Discharge summary generated",
              "New OPD Appointment booked",
            ].map((activity, index) => (

              <div
                key={index}
                className="flex items-start gap-4"
              >

                <div
                  className="
                    mt-1.5
                    h-2.5
                    w-2.5
                    rounded-full
                    bg-[#6a2f33]
                  "
                />

                <div>

                  <p className="font-medium text-[#2b0b08]">

                    {activity}

                  </p>

                  <p className="text-sm text-[#87565b]">

                    {index + 2} min ago

                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

            {/* Hospital Overview */}

      <section className="grid gap-6 lg:grid-cols-3">

        {/* Bed Occupancy */}

        <div
          className="
            rounded-3xl
            border
            border-[#ece1e2]
            bg-white
            p-6
            shadow-sm
          "
        >

          <h2 className="mb-6 text-xl font-semibold text-[#2b0b08]">
            Bed Occupancy
          </h2>

          <div className="space-y-5">

            {[
              ["ICU", "18 / 20", "90%"],
              ["General Ward", "82 / 100", "82%"],
              ["Private Rooms", "34 / 40", "85%"],
              ["Emergency", "12 / 15", "80%"],
            ].map(([ward, beds, percent]) => (

              <div key={ward}>

                <div className="mb-2 flex justify-between">

                  <span className="font-medium text-[#2b0b08]">
                    {ward}
                  </span>

                  <span className="text-[#87565b]">
                    {beds}
                  </span>

                </div>

                <div className="h-2 rounded-full bg-[#ece1e2]">

                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#4c1711] to-[#87565b]"
                    style={{
                      width: percent,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Pharmacy Inventory */}

        <div
          className="
            rounded-3xl
            border
            border-[#ece1e2]
            bg-white
            p-6
            shadow-sm
          "
        >

          <h2 className="mb-6 text-xl font-semibold text-[#2b0b08]">
            Pharmacy Inventory
          </h2>

          <div className="space-y-4">

            {[
              ["Paracetamol 650", "Healthy", "green"],
              ["Meropenem", "Low Stock", "amber"],
              ["Pantoprazole", "Healthy", "green"],
              ["Normal Saline", "Critical", "red"],
              ["Insulin", "Healthy", "green"],
            ].map(([drug, status, color]) => (

              <div
                key={drug}
                className="flex items-center justify-between"
              >

                <div>

                  <p className="font-medium text-[#2b0b08]">
                    {drug}
                  </p>

                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold
                  ${
                    color === "green"
                      ? "bg-green-100 text-green-700"
                      : color === "amber"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {status}
                </span>

              </div>

            ))}

          </div>

        </div>

        {/* Laboratory */}

        <div
          className="
            rounded-3xl
            border
            border-[#ece1e2]
            bg-white
            p-6
            shadow-sm
          "
        >

          <h2 className="mb-6 text-xl font-semibold text-[#2b0b08]">
            Laboratory
          </h2>

          <div className="space-y-5">

            <div className="flex items-center justify-between">

              <span className="text-[#87565b]">
                Pending Reports
              </span>

              <span className="text-3xl font-bold text-[#4c1711]">
                18
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-[#87565b]">
                Completed Today
              </span>

              <span className="text-3xl font-bold text-green-600">
                74
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-[#87565b]">
                Critical Values
              </span>

              <span className="text-3xl font-bold text-red-600">
                3
              </span>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}