"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { navigation, UserRole } from "./navigation";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  role: UserRole;
}

export default function AppSidebar({
  role,
}: AppSidebarProps) {
  const pathname = usePathname();

  const items = navigation.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside
      className="
        hidden
        lg:flex
        h-screen
        w-72
        shrink-0
        flex-col
        border-r
        border-[#ece1e2]
        bg-white
      "
    >
      {/* Logo */}

      <div className="border-b border-[#ece1e2] px-8 py-7">

        <Image
          src="/anexra-wordmark.svg"
          alt="Anexra"
          width={170}
          height={42}
          priority
        />

        <p className="mt-3 text-sm text-[#87565b]">
          Electronic Healthcare Record
        </p>

      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">

        {items.map((item) => {

          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                `
                group
                flex
                items-center
                gap-4
                rounded-2xl
                px-4
                py-3
                text-sm
                font-medium
                transition-all
                duration-200
                `,
                active
                  ? `
                    bg-gradient-to-r
                    from-[#4c1711]
                    to-[#6a2f33]
                    text-white
                    shadow-lg
                    shadow-[#4c1711]/20
                  `
                  : `
                    text-[#5e5254]
                    hover:bg-[#f7f3f3]
                    hover:text-[#2b0b08]
                  `
              )}
            >
              <Icon className="h-5 w-5" />

              {item.title}
            </Link>
          );
        })}

      </nav>

      {/* Footer */}

      <div className="border-t border-[#ece1e2] p-5">

        <div className="mb-5">

          <p className="font-semibold text-[#2b0b08]">
            Administrator
          </p>

          <p className="text-sm text-[#87565b]">
            admin@anexra.com
          </p>

        </div>

        <button
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-2xl
            border
            border-[#ece1e2]
            px-4
            py-3
            text-sm
            text-[#5e5254]
            transition-colors
            hover:bg-[#f7f3f3]
            hover:text-[#2b0b08]
          "
        >
          <LogOut className="h-5 w-5" />

          Logout
        </button>

      </div>

    </aside>
  );
}