import {
  Activity,
  BedDouble,
  CalendarDays,
  ClipboardList,
  FileBarChart2,
  FileCheck2,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  Settings,
  Stethoscope,
  Syringe,
  UserPlus,
  Users,
  LucideIcon,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    },

    {
      groupLabel: "Patient Management",
      menus: [
        {
          href: "",
          label: "Patients",
          icon: Users,
          submenus: [
            {
              href: "/patients",
              label: "Patient List",
            },
            {
              href: "/patients/new",
              label: "Register Patient",
            },
            {
              href: "/appointments",
              label: "Appointments",
            },
          ],
        },
        {
          href: "/admissions",
          label: "Admissions",
          icon: BedDouble,
        },
        {
          href: "/my-patients",
          label: "My Patients",
          icon: HeartPulse,
        },
      ],
    },

    {
      groupLabel: "Clinical Care",
      menus: [
        {
          href: "/patient-chart",
          label: "Patient Chart",
          icon: ClipboardList,
        },
        {
          href: "/clinical-notes",
          label: "Clinical Notes",
          icon: ClipboardList,
        },
        {
          href: "/clinical-forms",
          label: "Clinical Forms",
          icon: FileCheck2,
        },
        {
          href: "/orders",
          label: "Orders",
          icon: Activity,
        },
        {
          href: "/referrals",
          label: "Referrals",
          icon: Stethoscope,
        },
      ],
    },

    {
      groupLabel: "Nursing",
      menus: [
        {
          href: "/vitals",
          label: "Vital Charting",
          icon: Activity,
        },
        {
          href: "/io-chart",
          label: "Input / Output Chart",
          icon: ClipboardList,
        },
      ],
    },

    {
      groupLabel: "Laboratory & Blood Bank",
      menus: [
        {
          href: "/investigations",
          label: "Investigations",
          icon: FlaskConical,
        },
        {
          href: "",
          label: "Blood Bank",
          icon: Syringe,
          submenus: [
            {
              href: "/blood/request",
              label: "Blood Unit Request",
            },
            {
              href: "/blood/return",
              label: "Blood Unit Return",
            },
          ],
        },
      ],
    },

    {
      groupLabel: "Procedures",
      menus: [
        {
          href: "/surgery",
          label: "Surgery Requests",
          icon: Stethoscope,
        },
        {
          href: "/line-insertion",
          label: "Line & Insertion",
          icon: Activity,
        },
      ],
    },

    {
      groupLabel: "Discharge",
      menus: [
        {
          href: "/initiate-discharge",
          label: "Initiate Discharge",
          icon: FileCheck2,
        },
        {
          href: "/discharge-summary",
          label: "Discharge Summary",
          icon: FileCheck2,
        },
        {
          href: "/discharge-timeline",
          label: "Discharge Timeline",
          icon: CalendarDays,
        },
      ],
    },

    {
      groupLabel: "Administration",
      menus: [
        {
          href: "/reports",
          label: "Reports",
          icon: FileBarChart2,
        },
        {
          href: "/settings",
          label: "Settings",
          icon: Settings,
        },
      ],
    },
  ];
}