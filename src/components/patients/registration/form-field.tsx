"use client";

import { Controller, useFormContext } from "react-hook-form";

import type { ReactNode } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function getErrorMessage(
  errors: Record<string, { message?: string } | undefined>,
  name: string,
): string | undefined {
  return errors[name]?.message;
}

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null;

  return <p className="text-xs font-medium text-red-600">{message}</p>;
}

interface BaseFieldProps {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

interface TextFieldProps extends BaseFieldProps {
  placeholder?: string;
  type?: string;
}

export function TextField({
  name,
  label,
  placeholder,
  type = "text",
  required,
  disabled,
  className,
}: TextFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = getErrorMessage(errors as Record<string, { message?: string }>, name);

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </Label>

      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        {...register(name)}
      />

      <FieldError message={error} />
    </div>
  );
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string;
  hint?: string;
}

export function TextareaField({
  name,
  label,
  placeholder,
  hint,
  required,
  disabled,
  className,
}: TextareaFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = getErrorMessage(errors as Record<string, { message?: string }>, name);

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </Label>

      <Textarea
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        {...register(name)}
      />

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      <FieldError message={error} />
    </div>
  );
}

interface SelectFieldProps extends BaseFieldProps {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function SelectField({
  name,
  label,
  options,
  placeholder,
  required,
  disabled,
  className,
}: SelectFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = getErrorMessage(errors as Record<string, { message?: string }>, name);

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </Label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full" aria-invalid={Boolean(error)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      <FieldError message={error} />
    </div>
  );
}

interface CheckboxFieldProps {
  name: string;
  label: string;
  description?: string;
  children?: ReactNode;
}

export function CheckboxField({
  name,
  label,
  description,
  children,
}: CheckboxFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id={name}
              checked={Boolean(field.value)}
              onCheckedChange={(checked) =>
                field.onChange(checked === true)
              }
            />

            <div className="space-y-0.5">
              <Label htmlFor={name}>{label}</Label>

              {description && (
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>

          {children}
        </div>
      )}
    />
  );
}
