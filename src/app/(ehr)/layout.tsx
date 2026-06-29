import type { ReactNode } from "react";

import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";

export default function EHRLayout({
  children,
}: {
  children: ReactNode;
}) {
  /*
    Temporary demo user.
    Later this will come from authentication/session.
  */

  const currentUser = {
    name: "Dr. Rajesh Shah",
    role: "Cardiologist",
    navigationRole: "doctor" as const,
  };

  return (
    <div className="flex h-screen bg-[#f4efee]">

      {/* Sidebar */}

      <AppSidebar
        role={currentUser.navigationRole}
      />

      {/* Main Content */}

      <div className="flex min-w-0 flex-1 flex-col">

        <AppHeader
          title="Dashboard"
          subtitle="Overview of today's hospital operations"
          user={{
            name: currentUser.name,
            role: currentUser.role,
          }}
        />

        {/* Page */}

        <main
          className="
            flex-1
            overflow-y-auto
            bg-[#f4efee]
            p-8
          "
        >
          {children}
        </main>

      </div>

    </div>
  );
}