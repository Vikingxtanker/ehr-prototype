import { TextareaField } from "./form-field";

export function MedicalStep() {
  return (
    <div className="space-y-6">
      <TextareaField
        name="allergies"
        label="Allergies"
        placeholder="e.g. Penicillin, Peanuts"
        hint="Separate multiple items with commas."
      />

      <TextareaField
        name="currentMedications"
        label="Current Medications"
        placeholder="e.g. Metformin 500mg, Amlodipine 5mg"
        hint="Separate multiple items with commas."
      />

      <TextareaField
        name="chronicConditions"
        label="Chronic Conditions"
        placeholder="e.g. Hypertension, Type 2 Diabetes"
        hint="Separate multiple items with commas."
      />

      <TextareaField
        name="chiefComplaint"
        label="Chief Complaint"
        placeholder="Describe the primary reason for this visit"
        required
      />
    </div>
  );
}
