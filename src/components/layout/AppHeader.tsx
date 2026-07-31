"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Bell, CalendarDays, Search } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AppHeaderProps {
  user?: {
    name: string;
    role: string;
  };
}

export default function AppHeader({
  user,
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-20
        items-center
        justify-between
        border-b
        border-[#ece1e2]
        bg-white/90
        px-4
        backdrop-blur-xl
        sm:px-8
      "
    >
      {/* Left */}

      <div className="flex items-center gap-4">

        <div className="flex items-center gap-3">

          <SidebarTrigger className="rounded-xl text-[#5e5254] hover:bg-[#f7f3f3] hover:text-[#2b0b08] lg:hidden" />

          <Image
            src="/anexra-wordmark.svg"
            alt="Anexra"
            width={120}
            height={30}
            className="h-auto w-auto lg:hidden"
          />

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-4">

        {/* Search */}

        <div className="relative hidden xl:block">

          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9d8f91]"
          />

          <Input
            placeholder="Search patients, UHID..."
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                router.push("/patients");
              }
            }}
            className="
              h-11
              w-80
              rounded-2xl
              border-[#ece1e2]
              bg-[#fcfaf9]
              pl-11
              focus-visible:ring-[#87565b]
            "
          />

        </div>

        {/* Date */}

        <div className="hidden items-center gap-2 rounded-2xl border border-[#ece1e2] bg-[#fcfaf9] px-4 py-2 lg:flex">

          <CalendarDays className="h-4 w-4 text-[#87565b]" />

          <span className="text-sm font-medium text-[#5e5254]">
            {format(new Date(), "dd MMM yyyy")}
          </span>

        </div>

        {/* Notifications */}

        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-2xl hover:bg-[#f7f3f3]"
        >
          <Bell className="h-5 w-5 text-[#5e5254]" />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        {/* User */}

        <div className="flex items-center gap-3 rounded-2xl border border-[#ece1e2] bg-[#fcfaf9] px-4 py-2">

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-[#6a2f33]
              to-[#4c1711]
              text-sm
              font-bold
              text-white
            "
          >
            {user?.name?.charAt(0) ?? "A"}
          </div>

          <div className="hidden text-left md:block">

            <p className="font-semibold text-[#2b0b08]">
              {user?.name ?? "User"}
            </p>

            <p className="text-sm text-[#87565b]">
              {user?.role ?? "Role"}
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}
