"use client";

import { useRef } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ChevronLeft, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/auth/demo-auth";
import { cn } from "@/lib/utils";
import { navigation, type NavGroup, type UserRole } from "./navigation";

interface AppSidebarProps {
  role: UserRole;
  user: {
    name: string;
    email: string;
  };
}

const GROUPS: Array<{ key: NavGroup; label: string }> = [
  { key: "main", label: "Main" },
  { key: "clinical", label: "Clinical" },
  { key: "administration", label: "Administration" },
];

export default function AppSidebar({
  role,
  user,
}: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { isMobile, state, setOpen, toggleSidebar } = useSidebar();

  const tempOpenRef = useRef(false);

  function handleMouseEnter() {
    if (state === "collapsed") {
      tempOpenRef.current = true;

      setOpen(true);
    }
  }

  function handleMouseLeave() {
    if (tempOpenRef.current) {
      tempOpenRef.current = false;

      setOpen(false);
    }
  }

  function handleArrowMouseEnter() {
    if (state === "collapsed") {
      tempOpenRef.current = true;

      setOpen(true);
    }
  }

  function handleArrowClick() {
    if (tempOpenRef.current) {
      tempOpenRef.current = false;

      setOpen(true);

      return;
    }

    toggleSidebar();
  }

  function handleLogout() {
    logout();

    router.replace("/");
  }

  function isActive(href: string) {
    if (href === "/patients") {
      return pathname.startsWith("/patients");
    }

    return pathname === href;
  }

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="z-40 border-r border-[#ece1e2] bg-white"
    >
      {/* Collapse toggle (between sidebar and topbar) */}

      {!isMobile && (
        <div
          className="absolute top-[12px] -right-[16px] z-[999]"
          onMouseEnter={handleArrowMouseEnter}
        >
          <Button
            onClick={handleArrowClick}
            variant="outline"
            size="icon"
            aria-label="Toggle Sidebar"
            className="h-8 w-8 cursor-pointer rounded-md border-[#ece1e2] bg-white shadow-sm hover:bg-[#f7f3f3]"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform ease-in-out duration-700",
                state === "collapsed" ? "rotate-180" : "rotate-0",
              )}
            />
          </Button>
        </div>
      )}

      {/* Logo */}

      <SidebarHeader className="border-b border-[#ece1e2] px-4 py-5 group-data-[collapsible=icon]:hidden">
        <Image
          src="/anexra-wordmark.svg"
          alt="Anexra"
          width={170}
          height={42}
          priority
          className="h-auto w-auto"
        />

        <p className="text-sm text-[#87565b]">
          Electronic Healthcare Record
        </p>
      </SidebarHeader>

      {/* Navigation */}

      <SidebarContent>
        {GROUPS.map((group) => {
          const items = navigation.filter(
            (item) => item.group === group.key && item.roles.includes(role),
          );

          if (items.length === 0) return null;

          return (
            <SidebarGroup key={group.key}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const Icon = item.icon;

                    if (item.comingSoon) {
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            disabled
                            tooltip={item.title}
                            className="h-11 rounded-xl text-sm text-[#b8abac]"
                          >
                            <Icon />

                            <span>{item.title}</span>

                            <SidebarMenuBadge className="bg-[#ece1e2] text-[#9d8f91]">
                              Soon
                            </SidebarMenuBadge>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }

                    const active = isActive(item.href);

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.title}
                          className={cn(
                            "h-11 rounded-xl text-sm",
                            active &&
                              "bg-gradient-to-r from-[#4c1711] to-[#6a2f33] text-white shadow-lg shadow-[#4c1711]/20 hover:bg-gradient-to-r hover:from-[#4c1711] hover:to-[#6a2f33] hover:text-white",
                          )}
                        >
                          <Link href={item.href}>
                            <Icon />

                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* Footer */}

      <SidebarFooter className="border-t border-[#ece1e2] p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="group-data-[collapsible=icon]:hidden flex flex-col gap-0.5 px-2 py-1.5">
              <p className="text-sm font-semibold text-[#2b0b08]">
                {user.name}
              </p>

              <p className="text-xs text-[#87565b]">
                {user.email}
              </p>
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="h-11 rounded-xl text-sm text-[#5e5254] hover:text-[#2b0b08]"
            >
              <LogOut />

              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
