"use client";

import { Bell, CalendarDays, Search } from "lucide-react";
import { format } from "date-fns";

import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import { UserNav } from "@/components/admin-panel/user-nav";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export function Navbar({
  title,
  subtitle,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#ece1e2] bg-white/90 backdrop-blur-xl">

      <div className="flex h-20 items-center justify-between px-8">

        {/* Left */}

        <div className="flex items-center gap-6">

          <SheetMenu />

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

          <div className="hidden items-center gap-2 rounded-2xl border border-[#ece1e2] bg-[#fcfaf9] px-4 py-2 lg:flex">

            <CalendarDays className="h-4 w-4 text-[#87565b]" />

            <span className="text-sm font-medium text-[#5e5254]">
              {format(new Date(), "dd MMM yyyy")}
            </span>

          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-2xl hover:bg-[#f7f3f3]"
          >
            <Bell className="h-5 w-5 text-[#5e5254]" />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />

          </Button>

          <UserNav />

        </div>

      </div>

    </header>
  );
}