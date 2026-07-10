"use client";

import Link from "next/link";
import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
  return (
    <DropdownMenu>

      <DropdownMenuTrigger asChild>

        <Button
          variant="ghost"
          className="
            h-auto
            rounded-2xl
            border
            border-[#ece1e2]
            bg-[#fcfaf9]
            px-3
            py-2
            hover:bg-[#f7f3f3]
          "
        >

          <div className="flex items-center gap-3">

            <Avatar className="h-11 w-11">

              <AvatarImage src="" />

              <AvatarFallback className="bg-gradient-to-br from-[#6a2f33] to-[#4c1711] font-semibold text-white">

                D

              </AvatarFallback>

            </Avatar>

            <div className="hidden text-left lg:block">

              <p className="font-semibold text-[#2b0b08]">

                Dr. Gaurav J. Gaikwad

              </p>

              <p className="text-sm text-[#87565b]">

                Gastroenterologist

              </p>

            </div>

            <ChevronDown className="hidden h-4 w-4 text-[#87565b] lg:block" />

          </div>

        </Button>

      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64"
      >

        <DropdownMenuLabel>

          <div className="flex items-center gap-3">

            <Avatar className="h-12 w-12">

              <AvatarFallback className="bg-gradient-to-br from-[#6a2f33] to-[#4c1711] text-white">

                D

              </AvatarFallback>

            </Avatar>

            <div>

              <p className="font-semibold">

                Dr. Gaurav J. Gaikwad

              </p>

              <p className="text-sm text-muted-foreground">

                Gastroenterologist

              </p>

            </div>

          </div>

        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>

          <DropdownMenuItem asChild>

            <Link href="/dashboard">

              <LayoutGrid className="mr-2 h-4 w-4" />

              Dashboard

            </Link>

          </DropdownMenuItem>

          <DropdownMenuItem asChild>

            <Link href="/profile">

              <User className="mr-2 h-4 w-4" />

              Profile

            </Link>

          </DropdownMenuItem>

          <DropdownMenuItem asChild>

            <Link href="/settings">

              <Settings className="mr-2 h-4 w-4" />

              Settings

            </Link>

          </DropdownMenuItem>

        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem>

          <LogOut className="mr-2 h-4 w-4" />

          Sign Out

        </DropdownMenuItem>

      </DropdownMenuContent>

    </DropdownMenu>
  );
}