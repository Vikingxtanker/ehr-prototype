"use client";
import { Menu } from "@/components/admin-panel/menu";
import { SidebarToggle } from "@/components/admin-panel/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export function Sidebar() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        !getOpenState() ? "w-[90px]" : "w-72",
        settings.disabled && "hidden"
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />

      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="flex h-full flex-col bg-white shadow-md dark:shadow-zinc-800"
      >
        {/* Logo */}

        <div className="px-3 py-4">

          <Button
            variant="link"
            asChild
            className="h-auto p-0"
          >
            <Link
              href="/dashboard"
              className={cn(
                "flex w-full items-center",
                getOpenState()
                  ? "justify-start px-2"
                  : "justify-center"
              )}
            >
              {getOpenState() ? (
                <Image
                  src="/anexra-wordmark.svg"
                  alt="Anexra"
                  width={150}
                  height={36}
                  priority
                  className="h-9 w-auto"
                />
              ) : (
                <Image
                  src="/anexra-logomark.svg"
                  alt="Anexra"
                  width={40}
                  height={40}
                  priority
                  className="h-10 w-10"
                />
              )}
            </Link>
          </Button>

        </div>

        {/* Scrollable Menu */}

        <div data-lenis-prevent className="min-h-0 flex-1 px-3">

          <Menu isOpen={getOpenState()} />

        </div>

        {/* Footer (later) */}

        {/* <Footer /> */}

      </div>
    </aside>
  );
}
