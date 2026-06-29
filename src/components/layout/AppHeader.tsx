"use client";

import { Bell, CalendarDays, Menu, Search } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  user?: {
    name: string;
    role: string;
  };
}

export default function AppHeader({
  title,
  subtitle,
  user,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#ece1e2] bg-white/90 px-8 backdrop-blur-xl">

      {/* Left */}

      <div className="flex items-center gap-6">

        {/* Mobile Menu */}

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page Title */}

        <div>

          <h1 className="text-3xl font-bold text-[#2b0b08]">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1 text-sm text-[#87565b]">
              {subtitle}
            </p>
          )}

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="relative hidden xl:block">

          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9d8f91]"
          />

          <Input
            placeholder="Search patients, UHID..."
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
              {user?.name ?? "Administrator"}
            </p>

            <p className="text-sm text-[#87565b]">
              {user?.role ?? "System Administrator"}
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}