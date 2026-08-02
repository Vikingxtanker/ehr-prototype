import { format } from "date-fns";

import type { IoCategory, IoEntry } from "./clinical-store";

export type IoGroup = "input" | "output";

export interface IoCategoryConfig {
  key: IoCategory;
  label: string;
  shortLabel: string;
  group: IoGroup;
  defaultRoute: string;
  placeholder: string;
}

export const IO_CATEGORIES: IoCategoryConfig[] = [
  {
    key: "oral",
    label: "Oral Input",
    shortLabel: "Oral",
    group: "input",
    defaultRoute: "Oral",
    placeholder: "Water / juice / soup",
  },
  {
    key: "rtFeed",
    label: "RT Feed",
    shortLabel: "RT",
    group: "input",
    defaultRoute: "NG",
    placeholder: "Feed name",
  },
  {
    key: "iv",
    label: "IV Input",
    shortLabel: "IV",
    group: "input",
    defaultRoute: "IV",
    placeholder: "e.g. NS, RL, D5",
  },
  {
    key: "bloodProduct",
    label: "Blood Products",
    shortLabel: "Blood",
    group: "input",
    defaultRoute: "IV",
    placeholder: "e.g. Packed RBC, FFP",
  },
  {
    key: "irrigation",
    label: "Irrigation",
    shortLabel: "Irrig.",
    group: "input",
    defaultRoute: "Wound",
    placeholder: "e.g. NS wash",
  },
  {
    key: "urine",
    label: "Urine Output",
    shortLabel: "Urine",
    group: "output",
    defaultRoute: "Catheter",
    placeholder: "e.g. Voided / FBC",
  },
  {
    key: "drain",
    label: "Drain Output",
    shortLabel: "Drain",
    group: "output",
    defaultRoute: "Surgical",
    placeholder: "e.g. ICD, JP, RT tube",
  },
  {
    key: "aspiration",
    label: "Aspiration",
    shortLabel: "Asp.",
    group: "output",
    defaultRoute: "Gastric",
    placeholder: "e.g. NG aspirate",
  },
  {
    key: "bowel",
    label: "Bowel Output",
    shortLabel: "Bowel",
    group: "output",
    defaultRoute: "Stool",
    placeholder: "e.g. Loose stool, constipated",
  },
  {
    key: "vomit",
    label: "Vomit Output",
    shortLabel: "Vomit",
    group: "output",
    defaultRoute: "Oral",
    placeholder: "e.g. Bile stained, coffee ground",
  },
  {
    key: "other",
    label: "Other Output",
    shortLabel: "Other",
    group: "output",
    defaultRoute: "Other",
    placeholder: "e.g. Sweat, weeping wound",
  },
];

export const IO_CATEGORY_MAP: Record<IoCategory, IoCategoryConfig> =
  Object.fromEntries(IO_CATEGORIES.map((config) => [config.key, config])) as Record<
    IoCategory,
    IoCategoryConfig
  >;

export const INPUT_CATEGORIES: IoCategory[] = IO_CATEGORIES.filter(
  (config) => config.group === "input",
).map((config) => config.key);

export const OUTPUT_CATEGORIES: IoCategory[] = IO_CATEGORIES.filter(
  (config) => config.group === "output",
).map((config) => config.key);

export const IO_ROUTES: string[] = [
  "Oral",
  "IV",
  "NG",
  "PEG",
  "Stoma",
  "Catheter",
  "Surgical",
  "Wound",
  "Gastric",
  "Stool",
  "Other",
];

export function ioConfig(category: IoCategory): IoCategoryConfig {
  return IO_CATEGORY_MAP[category];
}

export function isInputCategory(category: IoCategory): boolean {
  return ioConfig(category).group === "input";
}

export function parseIoVolume(entry: IoEntry): number {
  const value = parseFloat(entry.volume);

  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function totalInputVolume(entries: IoEntry[]): number {
  return entries.reduce(
    (sum, entry) =>
      isInputCategory(entry.category) ? sum + parseIoVolume(entry) : sum,
    0,
  );
}

export function totalOutputVolume(entries: IoEntry[]): number {
  return entries.reduce(
    (sum, entry) =>
      isInputCategory(entry.category) ? sum : sum + parseIoVolume(entry),
    0,
  );
}

export function totalVolumeByCategory(
  entries: IoEntry[],
  category: IoCategory,
): number {
  return entries
    .filter((entry) => entry.category === category)
    .reduce((sum, entry) => sum + parseIoVolume(entry), 0);
}

export function hourKey(value: string): string {
  return value.slice(0, 13);
}

export function floorToHour(value: string): string {
  return value.slice(0, 13);
}

export interface IoHourRow {
  key: string;
  date: string;
  time: string;
  byCategory: Partial<Record<IoCategory, IoEntry[]>>;
  totalInput: number;
  totalOutput: number;
  balance: number;
}

function keyToTime(key: string): string {
  const hour = key.slice(11, 13);

  return `${hour}:00`;
}

function keyToDate(key: string): string {
  const date = new Date(`${key}:00`);

  if (Number.isNaN(date.getTime())) return key.slice(0, 10);

  return format(date, "dd MMM yyyy");
}

function addHours(value: string, hours: number): string {
  const date = new Date(value);

  date.setHours(date.getHours() + hours);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}`;
}

function buildRow(key: string): IoHourRow {
  return {
    key,
    date: keyToDate(key),
    time: keyToTime(key),
    byCategory: {},
    totalInput: 0,
    totalOutput: 0,
    balance: 0,
  };
}

export function buildHourRows(
  entries: IoEntry[],
  fromValue: string,
  toValue: string,
): IoHourRow[] {
  const fromKey = floorToHour(fromValue);
  const toKey = floorToHour(toValue);

  if (fromKey > toKey) return [];

  const rows: IoHourRow[] = [];

  let cursor = fromKey;

  while (cursor <= toKey) {
    rows.push(buildRow(cursor));
    cursor = addHours(`${cursor}:00`, 1);
  }

  const rowMap = new Map(rows.map((row) => [row.key, row]));

  for (const entry of entries) {
    const key = hourKey(entry.recordedAt);
    const row = rowMap.get(key);

    if (!row) continue;

    row.byCategory[entry.category] ??= [];
    row.byCategory[entry.category]!.push(entry);

    const volume = parseIoVolume(entry);

    if (isInputCategory(entry.category)) {
      row.totalInput += volume;
    } else {
      row.totalOutput += volume;
    }
  }

  for (const row of rows) {
    row.balance = row.totalInput - row.totalOutput;
  }

  return rows;
}

export function formatEntryVolume(entry: IoEntry): string {
  const volume = parseIoVolume(entry);

  return volume > 0 ? `${Math.round(volume)} mL` : "";
}

export function formatBalance(value: number): string {
  if (value > 0) return `+${Math.round(value)}`;
  if (value < 0) return `\u2212${Math.abs(Math.round(value))}`;

  return "0";
}

export function formatTimeLabel(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export interface IoSummary {
  totalInput: number;
  totalOutput: number;
  balance: number;
}

export function summarizeEntries(entries: IoEntry[]): IoSummary {
  const totalInput = totalInputVolume(entries);
  const totalOutput = totalOutputVolume(entries);

  return {
    totalInput,
    totalOutput,
    balance: totalInput - totalOutput,
  };
}
