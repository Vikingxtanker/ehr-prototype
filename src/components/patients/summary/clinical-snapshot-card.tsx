"use client";

import { cn } from "@/lib/utils";
import type { VitalReading } from "@/lib/patients/clinical-store";
import { SectionCard } from "./section-card";

type RiskTone = "green" | "yellow" | "red" | "none";

const TONES: Record<RiskTone, string> = {
  green: "bg-[#e8f5e9] text-[#2e7d32]",
  yellow: "bg-[#fff3e0] text-[#ef6c00]",
  red: "bg-[#fdecea] text-[#c62828]",
  none: "bg-[#f5f5f5] text-[#999999]",
};

interface SnapshotItem {
  label: string;
  value: string;
  tone: RiskTone;
}

function toNumber(value: string | undefined): number | null {
  const num = value ? parseFloat(value) : NaN;

  return Number.isNaN(num) ? null : num;
}

function mewsScore(reading: VitalReading | undefined): number | null {
  if (!reading) return null;

  const hr = toNumber(reading.heartRate);
  const rr = toNumber(reading.respiratoryRate);
  const fahrenheit = toNumber(reading.temperature);
  const spo2 = toNumber(reading.spo2);
  const gcs = toNumber(reading.gcs);
  const sys = toNumber(reading.bloodPressure?.split("/")[0]);

  if ([hr, rr, fahrenheit, sys].some((value) => value === null)) return null;

  let score = 0;

  if (hr !== null) score += hr <= 40 ? 2 : hr <= 50 ? 1 : hr <= 100 ? 0 : hr <= 110 ? 1 : hr <= 129 ? 2 : 3;
  if (rr !== null) score += rr <= 8 ? 2 : rr <= 11 ? 1 : rr <= 20 ? 0 : rr <= 24 ? 1 : 3;
  if (fahrenheit !== null) {
    const celsius = ((fahrenheit - 32) * 5) / 9;
    score += celsius <= 35 ? 2 : celsius <= 36 ? 1 : celsius <= 38 ? 0 : celsius <= 38.5 ? 1 : 2;
  }
  if (sys !== null) score += sys <= 70 ? 3 : sys <= 80 ? 2 : sys <= 100 ? 1 : sys <= 199 ? 0 : 2;
  if (spo2 !== null) score += spo2 < 90 ? 3 : spo2 <= 94 ? 1 : 0;
  if (gcs !== null) score += gcs >= 15 ? 0 : gcs >= 13 ? 1 : 2;

  return score;
}

function newsScore(reading: VitalReading | undefined): number | null {
  if (!reading) return null;

  const hr = toNumber(reading.heartRate);
  const rr = toNumber(reading.respiratoryRate);
  const fahrenheit = toNumber(reading.temperature);
  const spo2 = toNumber(reading.spo2);
  const gcs = toNumber(reading.gcs);
  const sys = toNumber(reading.bloodPressure?.split("/")[0]);

  if ([hr, rr, fahrenheit, sys].some((value) => value === null)) return null;

  let score = 0;

  if (hr !== null) score += hr <= 40 ? 3 : hr <= 50 ? 1 : hr <= 90 ? 0 : hr <= 110 ? 1 : hr <= 130 ? 2 : 3;
  if (rr !== null) score += rr <= 8 ? 3 : rr <= 11 ? 1 : rr <= 20 ? 0 : rr <= 24 ? 2 : 3;
  if (spo2 !== null) score += spo2 <= 91 ? 3 : spo2 <= 93 ? 2 : spo2 <= 95 ? 1 : 0;
  if (fahrenheit !== null) {
    const celsius = ((fahrenheit - 32) * 5) / 9;
    score += celsius <= 35 ? 3 : celsius <= 36 ? 1 : celsius <= 38 ? 0 : celsius <= 39 ? 1 : 2;
  }
  if (sys !== null) score += sys <= 90 ? 3 : sys <= 100 ? 2 : sys <= 110 ? 1 : sys <= 219 ? 0 : 3;
  if (gcs !== null) score += gcs < 15 ? 3 : 0;

  return score;
}

function toneFromScore(score: number | null): RiskTone {
  if (score === null) return "none";

  if (score >= 5) return "red";

  if (score >= 2) return "yellow";

  return "green";
}

export function ClinicalSnapshotCard({
  initials,
  reading,
  className,
}: {
  initials: string;
  reading?: VitalReading;
  className?: string;
}) {
  const bmi = toNumber(reading?.bmi);
  const mews = mewsScore(reading);
  const news = newsScore(reading);

  const items: SnapshotItem[] = [
    {
      label: "BMI Indicator",
      value: bmi === null ? "\u2014" : `${bmi} \u00b7 ${bmi >= 18.5 && bmi <= 24.9 ? "Normal" : "Abnormal"}`,
      tone: bmi === null ? "none" : bmi >= 18.5 && bmi <= 24.9 ? "green" : "yellow",
    },
    { label: "MEWS Score", value: mews === null ? "\u2014" : String(mews), tone: toneFromScore(mews) },
    { label: "NEWS Score", value: news === null ? "\u2014" : String(news), tone: toneFromScore(news) },
    { label: "Risk Level", value: mews === null ? "\u2014" : mews >= 5 ? "High" : mews >= 2 ? "Medium" : "Low", tone: toneFromScore(mews) },
    { label: "Isolation Status", value: "\u2014", tone: "none" },
    { label: "Code Status", value: "\u2014", tone: "none" },
    { label: "Fall Risk", value: "\u2014", tone: "none" },
    { label: "Pressure Ulcer Risk", value: "\u2014", tone: "none" },
  ];

  return (
    <SectionCard title="Vitals & Images" className={className}>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6a2f33] to-[#4c1711] text-lg font-bold text-white">
          {initials}
        </div>

        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[#333333]">
            Patient Photo
          </p>

          <p className="text-[10px] text-[#888888]">As of admission</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[4px] border border-[#eeeeee] bg-[#fcfcfc] px-2 py-1.5"
          >
            <p className="text-[10px] font-semibold tracking-wide text-[#888888] uppercase">
              {item.label}
            </p>

            <span
              className={cn(
                "mt-0.5 inline-flex rounded px-1.5 py-0.5 text-[11px] font-semibold",
                TONES[item.tone],
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {!reading && (
        <p className="mt-3 text-[10px] text-[#888888]">
          Add latest vitals to calculate MEWS / NEWS scores.
        </p>
      )}
    </SectionCard>
  );
}
