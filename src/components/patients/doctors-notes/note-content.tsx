"use client";

import { cn } from "@/lib/utils";

export function NoteContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pn-viewer text-[12px] leading-relaxed text-[#333333]",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
