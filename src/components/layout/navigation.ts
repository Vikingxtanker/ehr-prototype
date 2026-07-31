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

export type NavGroup = "main" | "clinical" | "administration";

export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  group: NavGroup;
  /** Module is planned but not implemented yet. */
  comingSoon?: boolean;
}

export const navigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    group: "main",
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
    title: "My Patients",
    href: "/patients",
    icon: Users,
    group: "main",
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
    group: "clinical",
    roles: [
      "admin",
      "doctor",
      "receptionist",
    ],
    comingSoon: true,
  },

  {
    title: "Doctors",
    href: "/doctors",
    icon: UserRound,
    group: "clinical",
    roles: [
      "admin",
      "doctor",
    ],
    comingSoon: true,
  },

  {
    title: "Nursing",
    href: "/nursing",
    icon: HeartPulse,
    group: "clinical",
    roles: [
      "admin",
      "nurse",
    ],
    comingSoon: true,
  },

  {
    title: "Pharmacy",
    href: "/pharmacy",
    icon: Pill,
    group: "clinical",
    roles: [
      "admin",
      "doctor",
      "pharmacist",
    ],
    comingSoon: true,
  },

  {
    title: "Laboratory",
    href: "/laboratory",
    icon: FlaskConical,
    group: "clinical",
    roles: [
      "admin",
      "doctor",
      "laboratory",
    ],
    comingSoon: true,
  },

  {
    title: "Wards",
    href: "/wards",
    icon: BedDouble,
    group: "clinical",
    roles: [
      "admin",
      "doctor",
      "nurse",
    ],
    comingSoon: true,
  },

  {
    title: "Billing",
    href: "/billing",
    icon: ReceiptIndianRupee,
    group: "administration",
    roles: [
      "admin",
      "receptionist",
    ],
    comingSoon: true,
  },

  {
    title: "Reports",
    href: "/reports",
    icon: FileBarChart2,
    group: "administration",
    roles: [
      "admin",
      "doctor",
      "pharmacist",
    ],
    comingSoon: true,
  },

  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    group: "administration",
    roles: [
      "admin",
    ],
    comingSoon: true,
  },
];
