"use client";

import Link from "next/link";

import {
  ArrowRight,
  BedDouble,
  ClipboardPlus,
  HeartPulse,
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { PatientTable } from "@/components/patients/patient-table";

import { usePatients } from "@/hooks/use-patients";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const patients = usePatients();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const ipdPatients = patients.filter((patient) => patient.admission !== null);

  const criticalPatients = ipdPatients.filter(
    (patient) => patient.admission?.status === "critical",
  );

  const admittedToday = ipdPatients.filter((patient) => {
    const today = new Date().toISOString().slice(0, 10);

    return patient.admission?.admittedAt === today;
  });

  const recentPatients = [...patients]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Admitted (IPD)",
      value: ipdPatients.length,
      icon: BedDouble,
      color: "text-[#4c1711]",
    },
    {
      title: "Critical",
      value: criticalPatients.length,
      icon: HeartPulse,
      color: "text-red-600",
    },
    {
      title: "Admitted Today",
      value: admittedToday.length,
      icon: UserPlus,
      color: "text-blue-600",
    },
    {
      title: "Total Registered",
      value: patients.length,
      icon: Users,
      color: "text-green-600",
    },
  ];

  const quickActions = [
    {
      title: "Register Patient",
      description: "Add a new patient via the registration flow",
      icon: UserPlus,
      href: "/patients/new",
    },
    {
      title: "My Patients",
      description: "View the current IPD roster",
      icon: BedDouble,
      href: "/patients",
    },
    {
      title: "Patient Records",
      description: "Open a registered patient's record",
      icon: ClipboardPlus,
      href: "/patients",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2b0b08]">{greeting}</h1>

          <p className="mt-1 text-sm text-[#87565b]">
            Here&apos;s an overview of today&apos;s in-patient activity.
          </p>
        </div>

        <Button variant="anexra" size="xl" asChild>
          <Link href="/patients/new">
            <UserPlus />

            Register New Patient
          </Link>
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-3xl border border-[#ece1e2] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#87565b]">{item.title}</p>

                <Icon className={cn("h-6 w-6", item.color)} />
              </div>

              <h2 className="mt-3 text-4xl font-bold text-[#2b0b08]">
                {item.value}
              </h2>
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
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center gap-4 rounded-3xl border border-[#ece1e2] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#87565b] hover:shadow-lg"
              >
                <Icon className="h-8 w-8 shrink-0 text-[#4c1711]" />

                <div className="min-w-0">
                  <h3 className="font-semibold text-[#2b0b08]">
                    {action.title}
                  </h3>

                  <p className="text-sm text-[#87565b]">
                    {action.description}
                  </p>
                </div>

                <ArrowRight className="ml-auto h-5 w-5 text-[#c79da1] transition-transform group-hover:translate-x-1" />
              </Link>
            );
          })}
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
              Recently registered and admitted patients
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href="/patients">
              View All

              <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#ece1e2] bg-white shadow-sm">
          {recentPatients.length > 0 ? (
            <PatientTable patients={recentPatients} />
          ) : (
            <Empty className="min-h-72">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>

                <EmptyTitle>No patients registered yet</EmptyTitle>
              </EmptyHeader>

              <EmptyContent>
                <EmptyDescription>
                  Register your first patient to start building the IPD
                  roster. Patient data is stored in memory for this session.
                </EmptyDescription>
              </EmptyContent>

              <Button variant="anexra" size="xl" asChild>
                <Link href="/patients/new">
                  <UserPlus />

                  Register New Patient
                </Link>
              </Button>
            </Empty>
          )}
        </div>
      </section>
    </div>
  );
}
