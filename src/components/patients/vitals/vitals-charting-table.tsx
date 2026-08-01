"use client";

import { Fragment } from "react";

import { Pencil, Plus, TrendingUp } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  FieldAudit,
  VitalFieldKey,
  VitalReading,
} from "@/lib/patients/clinical-store";
import { formatIST } from "@/lib/patients/audit";
import {
  computeTotalGCS,
  getVitalStatus,
  mewsScore,
  mewsStatus,
  STATUS_COLORS,
  toNumber,
  type VitalStatus,
} from "@/lib/patients/vitals";
import { cn } from "@/lib/utils";

export interface ChartRow {
  label: string;
  reference: string;
  getValue: (reading: VitalReading) => string;
  format: (value: string) => string;
  status: (reading: VitalReading, value: string) => VitalStatus;
  trend: (reading: VitalReading) => number | null;
  auditKeys: VitalFieldKey[];
}

export function rowAudit(
  reading: VitalReading,
  keys: VitalFieldKey[],
): FieldAudit | undefined {
  return keys
    .map((key) => reading.fieldAudit?.[key])
    .filter((audit): audit is FieldAudit => Boolean(audit))
    .sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    )[0];
}

export function isUpdateEntry(reading: VitalReading): boolean {
  const audit = reading.fieldAudit ?? {};

  return Object.values(audit).some(
    (entry) => entry && entry.at !== reading.createdAt,
  );
}

export interface ChartSection {
  title: string;
  rows: ChartRow[];
}

function fieldValue(key: VitalFieldKey) {
  return (reading: VitalReading) => (reading[key] ?? "").trim();
}

function fieldTrend(key: VitalFieldKey) {
  return (reading: VitalReading) => toNumber(reading[key]);
}

function valueStatus(label: string) {
  return (_reading: VitalReading, value: string) => getVitalStatus(label, value);
}

function noDataRow(label: string, reference: string): ChartRow {
  return {
    label,
    reference,
    getValue: () => "",
    format: (value) => value,
    status: () => "normal",
    trend: () => null,
    auditKeys: [],
  };
}

function gcsTotalValue(reading: VitalReading): string {
  return (
    computeTotalGCS(reading.gcsEye, reading.gcsVerbal, reading.gcsMotor) ||
    (reading.gcs ?? "")
  );
}

function gcsTotalTrend(reading: VitalReading): number | null {
  return toNumber(gcsTotalValue(reading));
}

function bpValue(reading: VitalReading): string {
  const sys = (reading.systolicBP ?? "").trim();
  const dia = (reading.diastolicBP ?? "").trim();

  if (!sys && !dia) return "";

  return `${sys}${dia ? ` / ${dia}` : ""}`;
}

function avpuStatus(_reading: VitalReading, value: string): VitalStatus {
  switch (value) {
    case "Unresponsive":
      return "critical";
    case "Voice":
    case "Pain":
      return "warning";
    default:
      return "normal";
  }
}

export const VITALS_SECTIONS: ChartSection[] = [
  {
    title: "MEWS",
    rows: [
      {
        label: "Total MEWS Score",
        reference: "0\u20134",
        getValue: (reading) => {
          const score = mewsScore(reading);

          return score === null ? "" : String(score);
        },
        format: (value) => value,
        status: (reading) => mewsStatus(mewsScore(reading)),
        trend: (reading) => mewsScore(reading),
        auditKeys: [],
      },
      {
        label: "Temperature",
        reference: "96\u2013100 \u00b0F",
        getValue: fieldValue("temperature"),
        format: (value) => `${value} \u00b0F`,
        status: valueStatus("Temperature"),
        trend: fieldTrend("temperature"),
        auditKeys: ["temperature"],
      },
      {
        label: "Blood Pressure",
        reference: "110\u2013130 / 70\u201385 mmHg",
        getValue: bpValue,
        format: (value) => `${value} mmHg`,
        status: (_reading, value) => getVitalStatus("Blood Pressure", value),
        trend: (reading) => toNumber(reading.systolicBP),
        auditKeys: ["systolicBP", "diastolicBP"],
      },
      {
        label: "Heart Rate",
        reference: "60\u2013100 bpm",
        getValue: fieldValue("heartRate"),
        format: (value) => `${value} bpm`,
        status: valueStatus("Heart Rate"),
        trend: fieldTrend("heartRate"),
        auditKeys: ["heartRate"],
      },
      {
        label: "Respiratory Rate",
        reference: "12\u201320 /min",
        getValue: fieldValue("respiratoryRate"),
        format: (value) => `${value} /min`,
        status: valueStatus("Respiratory Rate"),
        trend: fieldTrend("respiratoryRate"),
        auditKeys: ["respiratoryRate"],
      },
      {
        label: "SpO\u2082",
        reference: "95\u2013100 %",
        getValue: fieldValue("spo2"),
        format: (value) => `${value} %`,
        status: valueStatus("SpO\u2082"),
        trend: fieldTrend("spo2"),
        auditKeys: ["spo2"],
      },
      noDataRow("Oxygen Flow Rate", "\u2014"),
      noDataRow("Oxygen Device", "\u2014"),
      {
        label: "AVPU",
        reference: "Alert / Voice / Pain / Unresponsive",
        getValue: fieldValue("avpu"),
        format: (value) => value,
        status: avpuStatus,
        trend: () => null,
        auditKeys: ["avpu"],
      },
      noDataRow("Consciousness", "\u2014"),
      {
        label: "Pain Score",
        reference: "0\u20133",
        getValue: fieldValue("painScore"),
        format: (value) => `${value} /10`,
        status: valueStatus("Pain Score"),
        trend: fieldTrend("painScore"),
        auditKeys: ["painScore"],
      },
    ],
  },
  {
    title: "General Vitals",
    rows: [
      {
        label: "Height",
        reference: "\u2014",
        getValue: fieldValue("height"),
        format: (value) => `${value} cm`,
        status: valueStatus("Height"),
        trend: fieldTrend("height"),
        auditKeys: ["height"],
      },
      {
        label: "Weight",
        reference: "\u2014",
        getValue: fieldValue("weight"),
        format: (value) => `${value} kg`,
        status: valueStatus("Weight"),
        trend: fieldTrend("weight"),
        auditKeys: ["weight"],
      },
      {
        label: "BMI",
        reference: "18.5\u201324.9",
        getValue: fieldValue("bmi"),
        format: (value) => value,
        status: valueStatus("BMI"),
        trend: fieldTrend("bmi"),
        auditKeys: ["bmi"],
      },
      {
        label: "Blood Sugar (Random)",
        reference: "70\u2013140 mg/dL",
        getValue: fieldValue("bloodSugar"),
        format: (value) => `${value} mg/dL`,
        status: valueStatus("Blood Sugar"),
        trend: fieldTrend("bloodSugar"),
        auditKeys: ["bloodSugar"],
      },
      noDataRow("Blood Sugar (Fasting)", "70\u2013100 mg/dL"),
      noDataRow("Blood Sugar (Post Prandial)", "<140 mg/dL"),
      noDataRow("HbA1c", "<5.7 %"),
    ],
  },
  {
    title: "Respiratory",
    rows: [
      noDataRow("FiO\u2082", "21\u2013100 %"),
      {
        label: "Respiratory Rate",
        reference: "12\u201320 /min",
        getValue: fieldValue("respiratoryRate"),
        format: (value) => `${value} /min`,
        status: valueStatus("Respiratory Rate"),
        trend: fieldTrend("respiratoryRate"),
        auditKeys: ["respiratoryRate"],
      },
      {
        label: "Oxygen Saturation",
        reference: "95\u2013100 %",
        getValue: fieldValue("spo2"),
        format: (value) => `${value} %`,
        status: valueStatus("Oxygen Saturation"),
        trend: fieldTrend("spo2"),
        auditKeys: ["spo2"],
      },
      noDataRow("Peak Flow", "\u2014"),
      noDataRow("ETCO\u2082", "35\u201345 mmHg"),
      noDataRow("Oxygen Device", "\u2014"),
    ],
  },
  {
    title: "Neurological",
    rows: [
      {
        label: "Glasgow Coma Scale",
        reference: "3\u201315",
        getValue: gcsTotalValue,
        format: (value) => `${value} /15`,
        status: valueStatus("Glasgow Coma Scale"),
        trend: gcsTotalTrend,
        auditKeys: [],
      },
      {
        label: "Eye Response",
        reference: "1\u20134",
        getValue: fieldValue("gcsEye"),
        format: (value) => `${value} /4`,
        status: () => "normal",
        trend: fieldTrend("gcsEye"),
        auditKeys: ["gcsEye"],
      },
      {
        label: "Verbal Response",
        reference: "1\u20135",
        getValue: fieldValue("gcsVerbal"),
        format: (value) => `${value} /5`,
        status: () => "normal",
        trend: fieldTrend("gcsVerbal"),
        auditKeys: ["gcsVerbal"],
      },
      {
        label: "Motor Response",
        reference: "1\u20136",
        getValue: fieldValue("gcsMotor"),
        format: (value) => `${value} /6`,
        status: () => "normal",
        trend: fieldTrend("gcsMotor"),
        auditKeys: ["gcsMotor"],
      },
      {
        label: "AVPU",
        reference: "Alert / Voice / Pain / Unresponsive",
        getValue: fieldValue("avpu"),
        format: (value) => value,
        status: avpuStatus,
        trend: () => null,
        auditKeys: ["avpu"],
      },
    ],
  },
  {
    title: "Other Clinical Parameters",
    rows: [
      {
        label: "Urine Output",
        reference: "\u2014",
        getValue: fieldValue("urineOutput"),
        format: (value) => `${value} mL`,
        status: valueStatus("Urine Output"),
        trend: fieldTrend("urineOutput"),
        auditKeys: ["urineOutput"],
      },
      noDataRow("Skin Colour", "\u2014"),
      noDataRow("Activity", "\u2014"),
      noDataRow("Sedation Score", "\u2014"),
      noDataRow("Fall Risk", "\u2014"),
      noDataRow("Isolation Status", "\u2014"),
      {
        label: "Pain Scale",
        reference: "0\u20133",
        getValue: fieldValue("painScore"),
        format: (value) => `${value} /10`,
        status: valueStatus("Pain Scale"),
        trend: fieldTrend("painScore"),
        auditKeys: ["painScore"],
      },
      noDataRow("Fluid Balance", "\u2014"),
    ],
  },
];

function formatDate(iso: string): string {
  const date = new Date(iso);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  const date = new Date(iso);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function TrendButton({
  row,
  readings,
  onOpenTrend,
}: {
  row: ChartRow;
  readings: VitalReading[];
  onOpenTrend: (row: ChartRow) => void;
}) {
  const hasTrend = readings.some((reading) => row.trend(reading) !== null);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled={!hasTrend}
          onClick={() => onOpenTrend(row)}
          aria-label={`View trend for ${row.label}`}
          className="mx-auto flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-[#fdecea] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <TrendingUp className="h-3.5 w-3.5 text-[#d9534f]" />
        </button>
      </TooltipTrigger>

      <TooltipContent>View Trend</TooltipContent>
    </Tooltip>
  );
}

export function VitalsChartingTable({
  readings,
  selectedReadingId,
  onSelectReading,
  onOpenTrend,
  onEditParameter,
  onAddReading,
}: {
  readings: VitalReading[];
  selectedReadingId: string | null;
  onSelectReading: (id: string) => void;
  onOpenTrend: (row: ChartRow) => void;
  onEditParameter: (
    keys: VitalFieldKey[],
    label: string,
    source: VitalReading,
  ) => void;
  onAddReading: (keys: VitalFieldKey[], label: string) => void;
}) {
  const totalColumns = 1 + readings.length + 3;

  return (
    <div>
    <div className="max-h-[560px] overflow-auto rounded-[6px] border border-[#eeeeee] bg-white">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-[#f8f8f8] text-[#555555]">
            <th className="sticky top-0 left-0 z-30 h-9 min-w-[260px] border-b border-r border-[#eeeeee] bg-[#f8f8f8] px-3 text-left text-[12px] font-semibold">
              Parameter
            </th>

            {readings.map((reading) => {
              const isLatest = reading.id === readings[0]?.id;

              return (
              <th
                key={reading.id}
                className={cn(
                  "sticky top-0 z-20 min-w-[120px] border-b border-[#eeeeee] px-2 py-1 text-left font-semibold normal-case",
                  selectedReadingId === reading.id
                    ? "bg-[#fdecea]"
                    : "bg-[#f8f8f8]",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectReading(reading.id)}
                  className="block w-full cursor-pointer text-left"
                >
                  <span className="block text-[9px] font-bold tracking-wide text-[#888888] uppercase">
                    {reading.createdBy || "Unknown"}
                  </span>

                  <span className="block text-[12px] text-[#333333]">
                    {formatDate(reading.createdAt)}
                  </span>

                  <span className="block text-[10px] text-[#888888]">
                    {formatTime(reading.createdAt)}
                  </span>

                  {isLatest && (
                    <span className="mt-0.5 inline-block rounded-full bg-[#d9534f] px-1.5 py-px text-[8px] font-bold text-white uppercase">
                      Latest
                    </span>
                  )}
                </button>
              </th>
              );
            })}

            <th className="sticky top-0 z-20 min-w-[110px] border-b border-[#eeeeee] bg-[#f8f8f8] px-3 text-left text-[12px] font-semibold">
              Reference
            </th>

            <th className="sticky top-0 z-20 w-[60px] border-b border-[#eeeeee] bg-[#f8f8f8] px-2 text-center text-[12px] font-semibold">
              Trend
            </th>

            <th className="sticky top-0 z-20 w-[56px] border-b border-[#eeeeee] bg-[#f8f8f8] px-2 text-center text-[12px] font-semibold">
              Add
            </th>
          </tr>
        </thead>

        <tbody>
          {readings.length === 0 ? (
            <tr>
              <td
                colSpan={totalColumns}
                className="px-3 py-10 text-center text-[12px] text-[#888888]"
              >
                No vitals recorded in this range.
              </td>
            </tr>
          ) : (
            VITALS_SECTIONS.map((section) => (
              <Fragment key={section.title}>
                <tr className="border-b border-[#eeeeee] bg-[#fff2f2]">
                  <td
                    colSpan={totalColumns}
                    className="px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#5a2e33] uppercase"
                  >
                    {section.title}
                  </td>
                </tr>

                {section.rows.map((row, rowIndex) => {
                  const zebra = rowIndex % 2 === 1;
                  const canAdd =
                    row.auditKeys.length > 0 &&
                    !(
                      row.auditKeys.length === 1 &&
                      row.auditKeys[0] === "bmi"
                    );

                  return (
                  <tr
                    key={row.label}
                    data-zebra={zebra}
                    className={cn(
                      "group border-b border-[#eeeeee] transition-colors hover:bg-[#fdf3f3]",
                      zebra ? "bg-[#fcfcfc]" : "bg-white",
                    )}
                  >
                    <td
                      data-zebra={zebra}
                      className={cn(
                        "sticky left-0 z-10 border-r border-[#eeeeee] px-3 py-0 font-medium text-[#333333] group-hover:bg-[#fdf3f3]",
                        zebra ? "bg-[#fcfcfc]" : "bg-white",
                      )}
                    >
                      {row.label}
                    </td>

                    {readings.map((reading) => {
                      const raw = row.getValue(reading);
                      const display = raw === "" ? "\u2014" : row.format(raw);
                      const tone =
                        raw === ""
                          ? "text-[#cccccc]"
                          : STATUS_COLORS[row.status(reading, raw)];
                      const audit = rowAudit(reading, row.auditKeys);
                      const isLatest = reading.id === readings[0]?.id;
                      const fresh =
                        audit && audit.at === reading.createdAt
                          ? isUpdateEntry(reading)
                          : false;
                      const showDot = isLatest && fresh && raw !== "";
                      const canEdit =
                        row.auditKeys.length > 0 &&
                        !(
                          row.auditKeys.length === 1 &&
                          row.auditKeys[0] === "bmi"
                        );

                      return (
                        <Tooltip key={reading.id}>
                          <TooltipTrigger asChild>
                            <td
                              onClick={() => onSelectReading(reading.id)}
                              onDoubleClick={() => {
                                if (canEdit) {
                                  onEditParameter(
                                    row.auditKeys,
                                    row.label,
                                    reading,
                                  );
                                }
                              }}
                              className={cn(
                                "group/td relative cursor-pointer px-2 py-0 font-semibold",
                                selectedReadingId === reading.id &&
                                  "bg-[#fdecea]",
                                tone,
                              )}
                            >
                              <span className="inline-flex items-center gap-1">
                                {display}

                                {showDot && (
                                  <span
                                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d9534f]"
                                    aria-label="Updated in this entry"
                                  />
                                )}
                              </span>

                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onEditParameter(
                                      row.auditKeys,
                                      row.label,
                                      reading,
                                    );
                                  }}
                                  aria-label={`Edit ${row.label} for this recording`}
                                  className="absolute top-1 right-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded bg-white/90 text-[#d9534f] opacity-0 shadow-sm transition-opacity group-hover/td:opacity-100"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              )}
                            </td>
                          </TooltipTrigger>

                          <TooltipContent
                            side="top"
                            align="center"
                            className="max-w-xs flex-col items-start gap-1"
                          >
                            <span className="text-[11px] font-semibold text-white">
                              {row.label}
                            </span>

                            <span className="text-[11px] text-white/80">
                              Recorded by {reading.createdBy || "Unknown"} on{" "}
                              {formatIST(reading.createdAt)} IST
                            </span>

                            {audit &&
                              (audit.by !== reading.createdBy ||
                                audit.at !== reading.createdAt) && (
                                <span className="text-[11px] text-white/80">
                                  Edited by {audit.by || "Unknown"} on{" "}
                                  {formatIST(audit.at)} IST
                                </span>
                              )}

                            {audit &&
                              audit.at !== reading.createdAt &&
                              raw !== "" && (
                                <span className="text-[11px] text-amber-300">
                                  From an earlier recording
                                </span>
                              )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}

                    <td className="px-3 py-0 text-[#777777]">
                      {row.reference}
                    </td>

                    <td className="px-2 py-0 text-center">
                      <TrendButton
                        row={row}
                        readings={readings}
                        onOpenTrend={onOpenTrend}
                      />
                    </td>

                    <td className="px-2 py-0 text-center">
                      {canAdd && (
                        <button
                          type="button"
                          onClick={() => onAddReading(row.auditKeys, row.label)}
                          title={`Add ${row.label}`}
                          aria-label={`Add ${row.label}`}
                          className="mx-auto flex h-6 w-6 cursor-pointer items-center justify-center rounded opacity-0 transition-opacity hover:bg-[#fdecea] group-hover:opacity-100"
                        >
                          <Plus className="h-3.5 w-3.5 text-[#d9534f]" />
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>

    <div className="mt-1.5 rounded-[6px] border border-[#eeeeee] bg-[#fcfcfc] px-3 py-1.5 text-[10px] text-[#777777]">
      <span className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-[#d9534f]" />
        updated in the latest entry
      </span>
      <span className="ml-4">
        Hover a value to see who recorded it and when.
      </span>
    </div>
  </div>
  );
}
