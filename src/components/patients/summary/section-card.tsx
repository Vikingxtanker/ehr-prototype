import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-[6px] border border-[#e5c5c5] bg-white",
        className,
      )}
    >
      <header className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-[#eeeeee] px-3">
        <h3 className="text-[13px] font-semibold tracking-wide text-[#333333]">
          {title}
        </h3>

        <div className="flex items-center gap-2">{actions}</div>
      </header>

      <div className={cn("min-h-0 flex-1 p-3", bodyClassName)}>{children}</div>
    </section>
  );
}
