"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchableSelectProps {
  options: {
    value: string;
    label: string;
  }[];

  value: string;

  placeholder: string;

  onChange: (value: string) => void;

  disabled?: boolean;
}

export function SearchableLocationSelect({
  options,
  value,
  placeholder,
  onChange,
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between"
        >
          {value
            ? options.find(
                (option) => option.value === value
              )?.label
            : placeholder}

          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        data-lenis-prevent
        className="
          w-[var(--radix-popover-trigger-width)]
          p-0
        "
        align="start"
      >
        <Command>
          <CommandInput
            autoFocus
            placeholder={`Search ${placeholder.toLowerCase()}...`}
          />

          <CommandList
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="
              max-h-64
              overflow-y-auto
            "
          >
          {/* <CommandList
            data-lenis-prevent
            className="overflow-hidden"
          > */}
            <CommandEmpty>
              No results found.
            </CommandEmpty>

            <ScrollArea
              data-lenis-prevent
              className="h-64"
              onTouchMove={(e) => e.stopPropagation()}
            >
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />

                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}