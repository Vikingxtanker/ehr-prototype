import { RELATIONSHIPS } from "@/lib/constants/patient";

import { SelectField, TextField } from "./form-field";

export function ContactStep() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="font-semibold text-[#2b0b08]">Contact Information</h3>

          <p className="text-sm text-[#87565b]">
            Primary phone number is required for all follow-ups.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            name="phone"
            label="Mobile Number"
            placeholder="e.g. 9876543210"
            type="tel"
            required
          />

          <TextField
            name="email"
            label="Email Address"
            placeholder="e.g. rahul@example.com"
            type="email"
          />

          <TextField
            name="addressLine"
            label="Address"
            placeholder="House no, street, area"
            required
            className="sm:col-span-2 lg:col-span-1"
          />

          <TextField
            name="city"
            label="City"
            placeholder="e.g. Pune"
            required
          />

          <TextField
            name="state"
            label="State"
            placeholder="e.g. Maharashtra"
            required
          />

          <TextField
            name="pincode"
            label="PIN Code"
            placeholder="e.g. 411001"
            required
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="font-semibold text-[#2b0b08]">
            Emergency Contact
          </h3>

          <p className="text-sm text-[#87565b]">
            Contact person to reach in case of an emergency.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            name="emergencyContactName"
            label="Full Name"
            placeholder="e.g. Suresh Sharma"
            required
          />

          <SelectField
            name="emergencyContactRelationship"
            label="Relationship"
            required
            placeholder="Select relationship"
            options={RELATIONSHIPS.map((value) => ({
              value,
              label: value,
            }))}
          />

          <TextField
            name="emergencyContactPhone"
            label="Contact Number"
            placeholder="e.g. 9876543210"
            type="tel"
            required
          />
        </div>
      </section>
    </div>
  );
}
