import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UserRound,
  HeartPulse,
  Pill,
  FlaskConical,
  BedDouble,
  ReceiptIndianRupee,
  FileBarChart2,
  Settings,
} from "lucide-react";

export type UserRole =
  | "admin"
  | "doctor"
  | "nurse"
  | "pharmacist"
  | "receptionist"
  | "laboratory";

export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

export const navigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      "admin",
      "doctor",
      "nurse",
      "pharmacist",
      "receptionist",
      "laboratory",
    ],
  },

  {
    title: "Patients",
    href: "/patients",
    icon: Users,
    roles: [
      "admin",
      "doctor",
      "nurse",
      "pharmacist",
      "receptionist",
    ],
  },

  {
    title: "Appointments",
    href: "/appointments",
    icon: CalendarDays,
    roles: [
      "admin",
      "doctor",
      "receptionist",
    ],
  },

  {
    title: "Doctors",
    href: "/doctors",
    icon: UserRound,
    roles: [
      "admin",
      "doctor",
    ],
  },

  {
    title: "Nursing",
    href: "/nursing",
    icon: HeartPulse,
    roles: [
      "admin",
      "nurse",
    ],
  },

  {
    title: "Pharmacy",
    href: "/pharmacy",
    icon: Pill,
    roles: [
      "admin",
      "doctor",
      "pharmacist",
    ],
  },

  {
    title: "Laboratory",
    href: "/laboratory",
    icon: FlaskConical,
    roles: [
      "admin",
      "doctor",
      "laboratory",
    ],
  },

  {
    title: "Wards",
    href: "/wards",
    icon: BedDouble,
    roles: [
      "admin",
      "doctor",
      "nurse",
    ],
  },

  {
    title: "Billing",
    href: "/billing",
    icon: ReceiptIndianRupee,
    roles: [
      "admin",
      "receptionist",
    ],
  },

  {
    title: "Reports",
    href: "/reports",
    icon: FileBarChart2,
    roles: [
      "admin",
      "doctor",
      "pharmacist",
    ],
  },

  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: [
      "admin",
    ],
  },
];