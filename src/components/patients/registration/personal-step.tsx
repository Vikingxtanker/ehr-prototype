import {
  BLOOD_GROUPS,
  GENDERS,
  GENDER_LABELS,
  MARITAL_STATUSES,
  MARITAL_STATUS_LABELS,
} from "@/lib/constants/patient";

import { SelectField, TextField } from "./form-field";

export function PersonalStep() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <TextField
        name="firstName"
        label="First Name"
        placeholder="e.g. Rahul"
        required
      />

      <TextField
        name="lastName"
        label="Last Name"
        placeholder="e.g. Sharma"
        required
      />

      <TextField
        name="dateOfBirth"
        label="Date of Birth"
        type="date"
        required
      />

      <SelectField
        name="gender"
        label="Gender"
        required
        options={GENDERS.map((value) => ({
          value,
          label: GENDER_LABELS[value],
        }))}
      />

      <SelectField
        name="bloodGroup"
        label="Blood Group"
        required
        options={BLOOD_GROUPS.map((value) => ({ value, label: value }))}
      />

      <SelectField
        name="maritalStatus"
        label="Marital Status"
        required
        options={MARITAL_STATUSES.map((value) => ({
          value,
          label: MARITAL_STATUS_LABELS[value],
        }))}
      />

      <TextField
        name="occupation"
        label="Occupation"
        placeholder="e.g. Engineer"
        className="sm:col-span-2 lg:col-span-1"
      />
    </div>
  );
}
