export interface MedicineItem {
  generic: string;
  brand: string;
  form: string;
  strength: string;
}

export const MEDICINE_CATALOG: MedicineItem[] = [
  { generic: "Paracetamol", brand: "Dolo 650", form: "Tablet", strength: "650 mg" },
  { generic: "Paracetamol", brand: "Calpol 500", form: "Tablet", strength: "500 mg" },
  { generic: "Amoxicillin + Clavulanic Acid", brand: "Augmentin 625", form: "Tablet", strength: "625 mg" },
  { generic: "Amoxicillin", brand: "Moxikind 250", form: "Capsule", strength: "250 mg" },
  { generic: "Azithromycin", brand: "Azithral 500", form: "Tablet", strength: "500 mg" },
  { generic: "Ceftriaxone", brand: "Monocef 1g", form: "Injection", strength: "1 g" },
  { generic: "Cefixime", brand: "Taxim-O 200", form: "Tablet", strength: "200 mg" },
  { generic: "Omeprazole", brand: "Ocid 20", form: "Capsule", strength: "20 mg" },
  { generic: "Pantoprazole", brand: "Pan 40", form: "Tablet", strength: "40 mg" },
  { generic: "Ondansetron", brand: "Emeset 4", form: "Tablet", strength: "4 mg" },
  { generic: "Ranitidine", brand: "Rantac 150", form: "Tablet", strength: "150 mg" },
  { generic: "Metformin", brand: "Glycomet 500", form: "Tablet", strength: "500 mg" },
  { generic: "Amlodipine", brand: "Amlopres 5", form: "Tablet", strength: "5 mg" },
  { generic: "Losartan", brand: "Losar 50", form: "Tablet", strength: "50 mg" },
  { generic: "Atorvastatin", brand: "Storvas 10", form: "Tablet", strength: "10 mg" },
  { generic: "Insulin Glargine", brand: "Lantus", form: "Injection", strength: "100 IU" },
  { generic: "Tramadol", brand: "Tramazac 50", form: "Capsule", strength: "50 mg" },
  { generic: "Cetirizine", brand: "Cetzine 10", form: "Tablet", strength: "10 mg" },
  { generic: "Prednisolone", brand: "Wysolone 10", form: "Tablet", strength: "10 mg" },
  { generic: "Salbutamol", brand: "Asthalin HFA", form: "Inhaler", strength: "100 mcg" },
];

export function medicineLabel(medicine: MedicineItem): string {
  return `${medicine.generic} (${medicine.brand})`;
}

export function findMedicineByLabel(
  label: string,
): MedicineItem | undefined {
  const normalized = label.trim().toLowerCase();

  return MEDICINE_CATALOG.find(
    (medicine) => medicineLabel(medicine).toLowerCase() === normalized,
  );
}

export const MEDICINE_FORMS = [
  "Tablet",
  "Capsule",
  "Injection",
  "Syrup",
  "Suspension",
  "Inhaler",
  "Cream",
  "Drops",
  "Ampoule",
];

export const DOSE_UNITS = [
  "Tablet",
  "Capsule",
  "Ampoule",
  "mL",
  "mg",
  "g",
  "mcg",
  "IU",
  "Puff",
  "Drop",
  "Inhalation",
];

export const FREQUENCY_OPTIONS = [
  "OD",
  "BD",
  "TDS",
  "QID",
  "Every 6 Hours",
  "Every 8 Hours",
  "Every 12 Hours",
  "PRN",
];

export const FREQUENCY_MULTIPLIER: Record<string, number | undefined> = {
  OD: 1,
  BD: 2,
  TDS: 3,
  QID: 4,
  "Every 6 Hours": 4,
  "Every 8 Hours": 3,
  "Every 12 Hours": 2,
  PRN: undefined,
};

export const ROUTE_OPTIONS = [
  "Oral",
  "IV",
  "IM",
  "SC",
  "Topical",
  "Nebulization",
  "Eye",
  "Ear",
];

export const SCHEDULE_OPTIONS = ["Morning", "Afternoon", "Evening", "Night"];

export const INSTRUCTIONS = [
  "Before Food",
  "After Food",
  "With Food",
  "As Directed",
  "Empty Stomach",
];

export const DURATION_UNITS = ["Days", "Weeks", "Months"] as const;
export type DurationUnit = (typeof DURATION_UNITS)[number];

export const DOCTORS = [
  "Dr. Arjun Mehta",
  "Dr. Priya Sharma",
  "Dr. Rohan Kulkarni",
  "Dr. Neha Gupta",
  "System Administrator",
];

const MONTHS = [
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

const MED_DATETIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/;

export function formatMedDateTime(value: string): string {
  if (!value) return "\u2014";

  const match = value.match(MED_DATETIME_PATTERN);

  if (!match) return value;

  const day = Number(match[3]);
  const hour = Number(match[4] ?? 0);
  const minute = Number(match[5] ?? 0);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const pad = (n: number) => String(n).padStart(2, "0");

  const date = `${pad(day)} ${MONTHS[Number(match[2]) - 1]} ${match[1]}`;

  return value.includes("T")
    ? `${date}, ${pad(hour12)}:${pad(minute)} ${period}`
    : date;
}

export function addDurationToDatetimeLocal(
  datetime: string,
  duration: number,
  unit: DurationUnit,
): string {
  const match = datetime.match(MED_DATETIME_PATTERN);

  if (!match) return datetime;

  const days =
    unit === "Weeks" ? duration * 7 : unit === "Months" ? duration * 30 : duration;

  const date = new Date(
    Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4] ?? 0),
      Number(match[5] ?? 0),
    ),
  );

  date.setUTCDate(date.getUTCDate() + days);

  const pad = (n: number) => String(n).padStart(2, "0");
  const hasTime = datetime.includes("T");
  const time = hasTime
    ? `T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
    : "";

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}${time}`;
}

export function computeQuantity(input: {
  dose: string;
  frequency: string;
  duration: string;
  durationUnit: DurationUnit;
}): string {
  const dose = parseFloat(input.dose);
  const multiplier = FREQUENCY_MULTIPLIER[input.frequency];
  const duration = parseFloat(input.duration);

  if (
    Number.isNaN(dose) ||
    multiplier === undefined ||
    Number.isNaN(duration)
  ) {
    return "";
  }

  const daysPer =
    input.durationUnit === "Weeks"
      ? 7
      : input.durationUnit === "Months"
        ? 30
        : 1;

  return String(Math.round(dose * multiplier * duration * daysPer));
}
