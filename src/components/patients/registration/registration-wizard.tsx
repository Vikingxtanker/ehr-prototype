"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { addPatient } from "@/lib/patients/store";
import { parseList } from "@/lib/patients/format";
import {
  admissionSchema,
  contactSchema,
  defaultValues,
  medicalSchema,
  patientFormSchema,
  personalSchema,
  type PatientFormValues,
} from "@/lib/validations/patient-schema";
import type { NewPatientInput } from "@/lib/types/patient";

import { AdmissionStep } from "./admission-step";
import { ContactStep } from "./contact-step";
import { MedicalStep } from "./medical-step";
import { PersonalStep } from "./personal-step";
import { ReviewStep } from "./review-step";

const steps = [
  {
    title: "Personal Details",
    description: "Identity and demographics",
    schema: personalSchema,
  },
  {
    title: "Contact & Emergency",
    description: "Reachability details",
    schema: contactSchema,
  },
  {
    title: "Medical History",
    description: "Allergies, medications, complaint",
    schema: medicalSchema,
  },
  {
    title: "IPD Admission",
    description: "Ward and clinical details",
    schema: admissionSchema,
  },
] as const;

const REVIEW_STEP_INDEX = steps.length;

export function RegistrationWizard() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
  });

  const {
    formState: { errors },
    trigger,
    getValues,
    handleSubmit,
  } = form;

  const isReviewStep = currentStep === REVIEW_STEP_INDEX;

  async function handleNext() {
    // The admission step can be skipped entirely when the patient is not
    // admitted to IPD.
    if (currentStep === steps.length - 1 && !getValues("admitToIpd")) {
      setCurrentStep(REVIEW_STEP_INDEX);
      return;
    }

    const valid = await trigger(
      Object.keys(steps[currentStep].schema.shape) as Array<keyof PatientFormValues>,
    );

    if (valid) {
      setCurrentStep((step) => step + 1);
    }
  }

  function handleBack() {
    if (currentStep === 0) {
      router.back();
      return;
    }

    setCurrentStep((step) => step - 1);
  }

  function onSubmit(values: PatientFormValues) {
    const {
      allergies = "",
      currentMedications = "",
      chronicConditions = "",
      occupation = "",
      notes = "",
    } = values;

    const admission: NewPatientInput["admission"] = values.admitToIpd
      ? {
          type: values.admissionType,
          ward: values.ward,
          bedNumber: values.bedNumber.trim(),
          consultantName: values.consultantName.trim(),
          diagnosis: values.diagnosis.trim(),
          status: values.status,
          admittedAt: values.admittedAt,
          notes: notes.trim(),
        }
      : null;

    const input: NewPatientInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      bloodGroup: values.bloodGroup,
      maritalStatus: values.maritalStatus,
      occupation: occupation.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      addressLine: values.addressLine.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      pincode: values.pincode.trim(),
      emergencyContact: {
        name: values.emergencyContactName.trim(),
        relationship: values.emergencyContactRelationship.trim(),
        phone: values.emergencyContactPhone.trim(),
      },
      allergies: parseList(allergies),
      currentMedications: parseList(currentMedications),
      chronicConditions: parseList(chronicConditions),
      chiefComplaint: values.chiefComplaint.trim(),
      admission,
    };

    const patient = addPatient(input);

    toast.success(
      `${patient.firstName} ${patient.lastName} registered (${patient.uhid})`,
    );

    router.push(`/patients/${patient.id}`);
  }

  const stepErrorCount = isReviewStep
    ? 0
    : Object.keys(steps[currentStep].schema.shape).filter(
        (field) => (errors as Record<string, unknown>)[field],
      ).length;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-8"
      >
        {/* Stepper */}
        <ol className="flex items-center gap-2 sm:gap-3">
          {steps.map((step, index) => {
            const isDone = currentStep > index;
            const isCurrent = currentStep === index;

            return (
              <li
                key={step.title}
                className="flex flex-1 items-center gap-2 sm:gap-3"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isDone && "bg-green-100 text-green-700",
                    isCurrent &&
                      "bg-gradient-to-br from-[#6a2f33] to-[#4c1711] text-white shadow-md",
                    !isDone &&
                      !isCurrent &&
                      "bg-[#ece1e2] text-[#9d8f91]",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : index + 1}
                </div>

                <div className="hidden min-w-0 md:block">
                  <p
                    className={cn(
                      "truncate text-sm font-semibold",
                      isCurrent
                        ? "text-[#2b0b08]"
                        : isDone
                          ? "text-[#4c1711]"
                          : "text-[#9d8f91]",
                    )}
                  >
                    {step.title}
                  </p>

                  <p className="truncate text-xs text-[#9d8f91]">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 hidden h-px flex-1 sm:block",
                      isDone ? "bg-[#ddc5c7]" : "bg-[#ece1e2]",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Panel */}
        <div className="rounded-3xl border border-[#ece1e2] bg-white p-6 shadow-sm sm:p-8">
          {currentStep === 0 && <PersonalStep />}

          {currentStep === 1 && <ContactStep />}

          {currentStep === 2 && <MedicalStep />}

          {currentStep === 3 && <AdmissionStep />}

          {currentStep === REVIEW_STEP_INDEX && <ReviewStep />}
        </div>

        {/* Error hint */}
        {!isReviewStep && stepErrorCount > 0 && (
          <p className="text-sm font-medium text-red-600">
            {stepErrorCount === 1
              ? "One field needs attention before continuing."
              : `${stepErrorCount} fields need attention before continuing.`}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
          >
            <ArrowLeft />

            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>

          {isReviewStep ? (
            <Button type="submit" variant="anexra" size="xl">
              <UserPlus />

              Confirm & Register Patient
            </Button>
          ) : (
            <Button
              type="button"
              variant="anexra"
              size="xl"
              onClick={handleNext}
            >
              Continue

              <ArrowRight />
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
