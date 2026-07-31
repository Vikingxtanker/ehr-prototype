"use client";

import { useEffect, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSession, initSession, useDemoSession } from "@/lib/auth/demo-auth";

export default function EHRLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const session = useDemoSession();

  useEffect(() => {
    initSession();

    if (getSession() === null) {
      router.replace("/");
    }
  }, [router]);

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4efee]">
        <p className="text-sm text-[#9d8f91]">Checking session...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-[#f4efee]">

        {/* Sidebar */}

        <AppSidebar
          role={session.navigationRole}
          user={{
            name: session.name,
            email: session.email,
          }}
        />

        {/* Main Content */}

        <div className="flex min-w-0 flex-1 flex-col">

          <AppHeader
            user={{
              name: session.name,
              role: session.role,
            }}
          />

          {/* Page */}

          <main
            className="
              flex-1
              overflow-y-auto
              bg-[#f4efee]
              p-4
              sm:p-8
            "
          >
            {children}
          </main>

        </div>

        </div>

      </SidebarProvider>
    </TooltipProvider>
  );
}
