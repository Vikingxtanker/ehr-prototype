"use client";

import type { ReactNode } from "react";

import { Sidebar } from "@/components/admin-panel/sidebar";
import { Navbar } from "@/components/admin-panel/navbar";

import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

export default function EHRLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sidebar = useStore(useSidebar, (x) => x);

  if (!sidebar) return null;

  const { getOpenState, settings } = sidebar;

  return (
    <div className="min-h-screen bg-[#f4efee]">

      <Sidebar />

      <div
        className={cn(
          "min-h-screen transition-[margin-left] duration-300 ease-in-out",
          !settings.disabled &&
            (getOpenState() ? "lg:ml-[304px]" : "lg:ml-[106px]")
        )}
      >
        <Navbar
          title="Dashboard"
          subtitle="Overview of today's hospital operations"
        />

        <main className="p-8">
          {children}
        </main>
      </div>

    </div>
  );
}