import type { VitalReading } from "./clinical-store";

export type VitalStatus = "normal" | "warning" | "critical";

export const STATUS_COLORS: Record<VitalStatus, string> = {
  normal: "text-[#2e7d32]",
  warning: "text-[#ef6c00]",
  critical: "text-[#c62828]",
};

export function toNumber(value: string | undefined): number | null {
  const num = value ? parseFloat(value) : NaN;

  return Number.isNaN(num) ? null : num;
}

export function computeBMI(height: string, weight: string): string {
  const h = parseFloat(height);
  const w = parseFloat(weight);

  if (Number.isNaN(h) || Number.isNaN(w) || h <= 0 || w <= 0) return "";

  const meters = h / 100;

  return (w / (meters * meters)).toFixed(1);
}

export interface SelectOption {
  value: string;
  label: string;
}

export const GCS_EYE_OPTIONS: SelectOption[] = [
  { value: "", label: "Select eye response" },
  { value: "4", label: "4 \u2014 Spontaneous" },
  { value: "3", label: "3 \u2014 To voice" },
  { value: "2", label: "2 \u2014 To pain" },
  { value: "1", label: "1 \u2014 None" },
];

export const GCS_VERBAL_OPTIONS: SelectOption[] = [
  { value: "", label: "Select verbal response" },
  { value: "5", label: "5 \u2014 Oriented" },
  { value: "4", label: "4 \u2014 Confused" },
  { value: "3", label: "3 \u2014 Inappropriate words" },
  { value: "2", label: "2 \u2014 Incomprehensible sounds" },
  { value: "1", label: "1 \u2014 None" },
];

export const GCS_MOTOR_OPTIONS: SelectOption[] = [
  { value: "", label: "Select motor response" },
  { value: "6", label: "6 \u2014 Obeys commands" },
  { value: "5", label: "5 \u2014 Localizes pain" },
  { value: "4", label: "4 \u2014 Withdraws from pain" },
  { value: "3", label: "3 \u2014 Flexion (decorticate)" },
  { value: "2", label: "2 \u2014 Extension (decerebrate)" },
  { value: "1", label: "1 \u2014 None" },
];

export function computeTotalGCS(
  eye: string,
  verbal: string,
  motor: string,
): string {
  const e = toNumber(eye);
  const v = toNumber(verbal);
  const m = toNumber(motor);

  if (e === null || v === null || m === null) return "";

  return String(e + v + m);
}

export function getVitalStatus(label: string, value: string): VitalStatus {
  if (value.trim() === "") return "normal";

  const num = parseFloat(value);

  if (Number.isNaN(num)) return "normal";

  switch (label) {
    case "BMI":
      return num >= 18.5 && num <= 24.9 ? "normal" : "warning";
    case "Temperature":
      return num <= 99 ? "normal" : num <= 100.5 ? "warning" : "critical";
    case "Heart Rate":
    case "Pulse":
      return num >= 60 && num <= 100 ? "normal" : "warning";
    case "Respiratory Rate":
      return num >= 12 && num <= 20 ? "normal" : "warning";
    case "Systolic BP":
      return num >= 180 ? "critical" : num > 120 ? "warning" : "normal";
    case "Diastolic BP":
      return num >= 120 ? "critical" : num > 80 ? "warning" : "normal";
    case "Blood Pressure": {
      const [sysRaw, diaRaw] = value.split("/");
      const sys = parseFloat(sysRaw);
      const dia = parseFloat(diaRaw);

      if (Number.isNaN(sys) || Number.isNaN(dia)) return "normal";

      if (sys >= 180 || dia >= 120) return "critical";

      if (sys > 120 || dia > 80) return "warning";

      return "normal";
    }
    case "SpO\u2082":
    case "Oxygen Saturation":
      return num >= 95 ? "normal" : num >= 90 ? "warning" : "critical";
    case "Blood Sugar":
      return num >= 70 && num <= 140 ? "normal" : "warning";
    case "Pain Score":
    case "Pain Scale":
      return num <= 3 ? "normal" : num <= 7 ? "warning" : "critical";
    case "GCS":
    case "Glasgow Coma Scale":
      return num >= 15 ? "normal" : num >= 13 ? "warning" : "critical";
    default:
      return "normal";
  }
}

export function mewsScore(reading: VitalReading | undefined): number | null {
  if (!reading) return null;

  const hr = toNumber(reading.heartRate);
  const rr = toNumber(reading.respiratoryRate);
  const fahrenheit = toNumber(reading.temperature);
  const spo2 = toNumber(reading.spo2);
  const gcs = toNumber(reading.gcs);
  const sys = toNumber(reading.systolicBP);

  if ([hr, rr, fahrenheit, sys].some((value) => value === null)) return null;

  let score = 0;

  if (hr !== null)
    score +=
      hr <= 40 ? 2 : hr <= 50 ? 1 : hr <= 100 ? 0 : hr <= 110 ? 1 : hr <= 129 ? 2 : 3;
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

export function mewsStatus(score: number | null): VitalStatus {
  if (score === null) return "normal";

  if (score >= 5) return "critical";

  if (score >= 2) return "warning";

  return "normal";
}
