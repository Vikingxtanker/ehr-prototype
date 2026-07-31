"use client";

import { useState } from "react";

import { Plus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addOrder,
  removeOrder,
  type OrderStatus,
} from "@/lib/patients/clinical-store";
import { formatIST, getCurrentUserName } from "@/lib/patients/audit";
import { useClinicalRecords } from "@/hooks/use-clinical-records";
import type { Patient } from "@/lib/types/patient";
import { cn } from "@/lib/utils";
import { AddDialog, FormField } from "./add-dialog";
import { AuditTooltip } from "./audit-tooltip";
import { SectionCard } from "./section-card";

const STATUS_STYLES: Record<OrderStatus, string> = {
  Ordered: "bg-[#eaf2fb] text-[#2b6cb0]",
  Completed: "bg-[#e8f5e9] text-[#2e7d32]",
  Pending: "bg-[#fff3e0] text-[#ef6c00]",
  Cancelled: "bg-[#fdecea] text-[#c62828]",
};

const STATUSES: OrderStatus[] = ["Ordered", "Pending", "Completed", "Cancelled"];

export function OrdersCard({
  patient,
  className,
}: {
  patient: Patient;
  className?: string;
}) {
  const records = useClinicalRecords(patient.id);
  const orders = records.orders;

  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState("");
  const [status, setStatus] = useState<OrderStatus>("Ordered");
  const [department, setDepartment] = useState("");

  function handleSave() {
    const trimmed = order.trim();

    if (!trimmed) return;

    addOrder(
      patient.id,
      {
        order: trimmed,
        status,
        department: department.trim() || "General",
      },
      getCurrentUserName(),
    );

    setOrder("");
    setStatus("Ordered");
    setDepartment("");
    setOpen(false);
  }

  return (
    <SectionCard
      title="Current Orders"
      className={className}
      actions={
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex cursor-pointer items-center gap-0.5 text-[11px] font-semibold whitespace-nowrap text-[#4a90e2] hover:underline"
        >
          <Plus className="h-3 w-3" />

          Order
        </button>
      }
    >
      {orders.length === 0 ? (
        <p className="text-[12px] text-[#888888]">No current orders.</p>
      ) : (
        <div className="overflow-hidden rounded-[4px] border border-[#eeeeee]">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#f7f7f7] text-left text-[10px] font-semibold tracking-wide text-[#777777] uppercase">
                <th className="px-2 py-1.5 font-semibold">Date / Time</th>
                <th className="px-2 py-1.5 font-semibold">Order</th>
                <th className="px-2 py-1.5 font-semibold">Status</th>
                <th className="px-2 py-1.5 font-semibold">Dept.</th>
                <th className="px-2 py-1.5 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    index % 2 === 1 ? "bg-[#fafafa]" : "bg-white",
                    "transition-colors hover:bg-[#fdf3f3]",
                  )}
                >
                  <td className="px-2 py-1.5 whitespace-nowrap text-[#777777]">
                    {formatIST(row.createdAt)}
                  </td>

                  <td className="px-2 py-1.5 font-medium text-[#333333]">
                    <AuditTooltip audit={row}>
                      <span className="block cursor-default">{row.order}</span>
                    </AuditTooltip>
                  </td>

                  <td className="px-2 py-1.5">
                    <span
                      className={cn(
                        "inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap",
                        STATUS_STYLES[row.status],
                      )}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="px-2 py-1.5 text-[#777777]">
                    {row.department}
                  </td>

                  <td className="px-2 py-1.5 text-right">
                    <button
                      type="button"
                      onClick={() => removeOrder(patient.id, row.id)}
                      aria-label={`Remove order ${row.order}`}
                      className="cursor-pointer p-0.5 text-[#cccccc] transition-colors hover:text-[#c62828]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Order"
        onSave={handleSave}
      >
        <FormField label="Order">
          <Input
            value={order}
            onChange={(event) => setOrder(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSave();
            }}
            placeholder="e.g. Ceftriaxone 1g IV BD"
            autoFocus
          />
        </FormField>

        <FormField label="Status">
          <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Department">
          <Input
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            placeholder="e.g. Medicine / Lab / Radiology"
          />
        </FormField>
      </AddDialog>
    </SectionCard>
  );
}
