import type {
  Medication,
  MedicationAdministration,
} from "@/lib/patients/clinical-store";

export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const FREQUENCY_TIMES: Record<string, string[]> = {
  OD: ["08:00"],
  BD: ["08:00", "20:00"],
  TDS: ["08:00", "14:00", "20:00"],
  QID: ["08:00", "12:00", "16:00", "20:00"],
  "Every 6 Hours": ["00:00", "06:00", "12:00", "18:00"],
  "Every 8 Hours": ["06:00", "14:00", "22:00"],
  "Every 12 Hours": ["08:00", "20:00"],
  PRN: [],
};

const SCHEDULE_LABEL_TIMES: Record<string, string> = {
  Morning: "08:00",
  Afternoon: "14:00",
  Evening: "20:00",
  Night: "22:00",
};

export function getDoseTimes(medication: Medication): string[] {
  const scheduleTimes: string[] = [];

  for (const part of (medication.schedule ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)) {
    if (TIME_PATTERN.test(part)) {
      scheduleTimes.push(part);
    } else if (SCHEDULE_LABEL_TIMES[part]) {
      scheduleTimes.push(SCHEDULE_LABEL_TIMES[part]);
    }
  }

  if (scheduleTimes.length > 0) return scheduleTimes;

  return FREQUENCY_TIMES[medication.frequency] ?? [];
}

export function toDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

export function toLocalDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${toDateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function dateKeyToDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function nowLocalDateTime(): string {
  return toLocalDateTime(new Date());
}

export function shiftLocalDateTime(value: string, minutes: number): string {
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = (timePart ?? "00:00").split(":").map(Number);

  const date = new Date(year, month - 1, day, hour, minute);

  date.setMinutes(date.getMinutes() + minutes);

  return toLocalDateTime(date);
}

export function diffMinutes(later: string, earlier: string): number {
  const [laterDate, laterTime] = later.split("T");
  const [earlierDate, earlierTime] = earlier.split("T");

  const a = new Date(
    `${laterDate}T${laterTime ?? "00:00"}`,
  ).getTime();
  const b = new Date(
    `${earlierDate}T${earlierTime ?? "00:00"}`,
  ).getTime();

  return Math.round((a - b) / 60000);
}

export function withinOrderRange(
  scheduledAt: string,
  medication: Medication,
): boolean {
  if (
    medication.startDate &&
    scheduledAt < medication.startDate.slice(0, 16)
  ) {
    return false;
  }

  if (medication.endDate && scheduledAt > medication.endDate.slice(0, 16)) {
    return false;
  }

  return true;
}

export type DoseStateKey =
  | "administered"
  | "due"
  | "scheduled"
  | "missed"
  | "delayed"
  | "held"
  | "inactive";

export interface DoseState {
  key: DoseStateKey;
  event?: MedicationAdministration;
}

export function getDoseState(
  medication: Medication,
  scheduledAt: string,
  now: string,
  event?: MedicationAdministration,
): DoseState {
  if (event) {
    switch (event.status) {
      case "Administered":
        return { key: "administered", event };
      case "Delayed":
        return { key: "delayed", event };
      case "Held":
        return { key: "held", event };
      case "Missed":
        return { key: "missed", event };
      default:
        return { key: "scheduled", event };
    }
  }

  if (!withinOrderRange(scheduledAt, medication)) {
    return { key: "inactive" };
  }

  if (medication.held) {
    return { key: "held" };
  }

  const minutesSinceScheduled = diffMinutes(now, scheduledAt);

  if (minutesSinceScheduled >= -15 && minutesSinceScheduled <= 240) {
    return { key: "due" };
  }

  if (minutesSinceScheduled > 240) {
    return { key: "missed" };
  }

  return { key: "scheduled" };
}

export interface MarDateRange {
  dates: string[];
  todayKey: string;
}

const MAX_DATE_COLUMNS = 14;
const MIN_DATE_COLUMNS = 7;

export function buildMarDateRange(
  medications: Medication[],
  today: Date = new Date(),
): MarDateRange {
  const todayKey = toDateKey(today);
  const todayDate = dateKeyToDate(todayKey);

  let earliest = todayDate;

  for (const medication of medications) {
    const start = medication.startDate?.slice(0, 10);

    if (!start) continue;

    const startDate = dateKeyToDate(start);

    if (!Number.isNaN(startDate.getTime()) && startDate < earliest) {
      earliest = startDate;
    }
  }

  const minStart = new Date(todayDate);

  minStart.setDate(todayDate.getDate() - (MIN_DATE_COLUMNS - 1));

  let startDate = earliest < minStart ? earliest : minStart;

  const maxSpan = (MAX_DATE_COLUMNS - 1) * 86400000;

  if (todayDate.getTime() - startDate.getTime() > maxSpan) {
    startDate = new Date(todayDate.getTime() - maxSpan);
  }

  const dates: string[] = [];

  for (
    let cursor = new Date(startDate);
    cursor.getTime() <= todayDate.getTime();
    cursor.setDate(cursor.getDate() + 1)
  ) {
    dates.push(toDateKey(cursor));
  }

  return { dates: dates.reverse(), todayKey };
}

export interface MarGroup {
  id: string;
  label: string;
  medications: Medication[];
}

const GROUP_RULES: Array<{
  id: string;
  label: string;
  match: (medication: Medication) => boolean;
}> = [
  {
    id: "chemotherapy",
    label: "Chemotherapy",
    match: (medication) =>
      /chemo|cisplatin|carboplatin|doxorubicin|paclitaxel|cyclophosphamide|methotrexate|vincristine|fluorouracil|etoposide/i.test(
        medication.drug,
      ),
  },
  {
    id: "stat-dose",
    label: "STAT Dose",
    match: (medication) =>
      Boolean(medication.statDose) || medication.priority === "STAT",
  },
  {
    id: "sos-prn",
    label: "SOS / PRN",
    match: (medication) =>
      Boolean(medication.sos) || medication.priority === "PRN",
  },
  {
    id: "high-alert",
    label: "High Alert Medications",
    match: (medication) =>
      /insulin|heparin|warfarin|enoxaparin|dopamine|nitroglycerin|digoxin|morphine|fentanyl|potassium/i.test(
        medication.drug,
      ),
  },
  {
    id: "antibiotics",
    label: "Antibiotics",
    match: (medication) =>
      /amox|cef|penicil|azithro|cipro|levoflox|clav|metronidazole|meropenem|vancomy|clinda|erythro|doxy|sulfa/i.test(
        medication.drug,
      ),
  },
  {
    id: "iv-fluids",
    label: "IV Fluids",
    match: (medication) =>
      medication.route === "IV" &&
      /fluid|normal saline|dextrose|saline|ringer|\bns\b|\brl\b|\bdns\b/i.test(
        medication.drug,
      ),
  },
  {
    id: "discharge",
    label: "Discharge Medications",
    match: (medication) => /discharge/i.test(medication.instructions ?? ""),
  },
  {
    id: "routine",
    label: "Routine Medications",
    match: () => true,
  },
];

export function groupMedications(medications: Medication[]): MarGroup[] {
  const groups: MarGroup[] = GROUP_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    medications: [],
  }));

  for (const medication of medications) {
    const group =
      groups.find((group) => {
        const rule = GROUP_RULES.find((item) => item.id === group.id);

        return rule?.match(medication) ?? false;
      }) ?? groups[groups.length - 1];

    group.medications.push(medication);
  }

  return groups.filter((group) => group.medications.length > 0);
}

export interface TrendResult {
  expected: number;
  administered: number;
  percent: number;
}

export function computeTrend(
  medication: Medication,
  dates: string[],
  administrations: MedicationAdministration[],
  now: string,
): TrendResult {
  const times = getDoseTimes(medication);

  let expected = 0;
  let administered = 0;

  for (const date of dates) {
    if (date > now.slice(0, 10)) continue;

    for (const time of times) {
      const scheduledAt = `${date}T${time}`;

      if (!withinOrderRange(scheduledAt, medication)) continue;

      expected += 1;

      const event = administrations.find(
        (item) =>
          item.medicationId === medication.id &&
          item.scheduledAt === scheduledAt,
      );

      if (event?.status === "Administered") administered += 1;
    }
  }

  const percent =
    expected > 0 ? Math.round((administered / expected) * 100) : 0;

  return { expected, administered, percent };
}

export function formatDateHeader(key: string): string {
  const [year, month, day] = key.split("-").map(Number);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${day} ${monthNames[month - 1]} ${year}`;
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

export interface TodayDoseSummary {
  given: number;
  pending: number;
  missed: number;
}

export function getTodayDoseSummary(
  medication: Medication,
  todayKey: string,
  administrations: MedicationAdministration[],
  now: string,
): TodayDoseSummary {
  const summary: TodayDoseSummary = { given: 0, pending: 0, missed: 0 };

  for (const time of getDoseTimes(medication)) {
    const scheduledAt = `${todayKey}T${time}`;

    const event = administrations.find(
      (item) =>
        item.medicationId === medication.id &&
        item.scheduledAt === scheduledAt,
    );

    const state = getDoseState(medication, scheduledAt, now, event);

    if (state.key === "administered") summary.given += 1;
    else if (state.key === "missed") summary.missed += 1;
    else if (state.key === "due" || state.key === "scheduled") {
      summary.pending += 1;
    }
  }

  return summary;
}

const DURATION_DAYS: Record<string, number> = {
  Days: 1,
  Weeks: 7,
  Months: 30,
};

export function getTherapyProgress(
  medication: Medication,
  today: Date = new Date(),
): { current: number; total: number } | null {
  if (!medication.startDate) return null;

  const start = dateKeyToDate(medication.startDate.slice(0, 10));

  if (Number.isNaN(start.getTime())) return null;

  const todayDate = dateKeyToDate(toDateKey(today));
  const current = Math.max(
    1,
    Math.floor((todayDate.getTime() - start.getTime()) / 86400000) + 1,
  );

  let total: number | null = null;

  if (medication.endDate) {
    const end = dateKeyToDate(medication.endDate.slice(0, 10));

    if (!Number.isNaN(end.getTime())) {
      total = Math.max(
        1,
        Math.floor((end.getTime() - start.getTime()) / 86400000) + 1,
      );
    }
  }

  if (total === null && medication.duration) {
    const days = Number(medication.duration);

    if (!Number.isNaN(days)) {
      total = Math.round(
        days * (DURATION_DAYS[medication.durationUnit ?? "Days"] ?? 1),
      );
    }
  }

  return { current, total: total ?? 0 };
}
