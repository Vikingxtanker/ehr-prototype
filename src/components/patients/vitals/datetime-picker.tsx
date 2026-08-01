"use client";

import { useState } from "react";

import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatLocalDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function toLocalDateTimeInput(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  let hour = get("hour");

  if (hour === "24") hour = "00";

  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

function formatDisplay(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [dateText, setDateText] = useState(() => value.slice(0, 10));
  const [timeText, setTimeText] = useState(() =>
    value.length >= 16 ? value.slice(11, 16) : "00:00",
  );

  const selectedDate = dateText
    ? new Date(`${dateText}T00:00:00`)
    : undefined;

  function apply() {
    onChange(`${dateText}T${timeText || "00:00"}`);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-[190px] justify-between gap-2 text-[11px] font-normal text-[#333333]"
        >
          <span className="truncate">{value ? formatDisplay(value) : placeholder}</span>

          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#888888]" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) =>
            setDateText(date ? formatLocalDate(date) : "")
          }
        />

        <div className="mt-2 flex items-center gap-2 border-t border-[#eeeeee] pt-2">
          <Input
            type="time"
            value={timeText}
            onChange={(event) => setTimeText(event.target.value)}
            className="h-8 text-[11px]"
          />

          <Button
            size="sm"
            onClick={apply}
            className="h-8 bg-[#d9534f] text-white hover:bg-[#c94f4b]"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
