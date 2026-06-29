import { z } from "zod";

export const studentRegisterSchema = z.object({
firstName: z
.string()
.min(2, "First name must be at least 2 characters"),

lastName: z
.string()
.min(2, "Last name must be at least 2 characters"),

email: z
.string()
.trim()
.toLowerCase()
.email("Please enter a valid email address"),

password: z
.string()
.min(8, "Password must be at least 8 characters")
.regex(/[A-Z]/, "Must contain at least one uppercase letter")
.regex(/[a-z]/, "Must contain at least one lowercase letter")
.regex(/[0-9]/, "Must contain at least one number")
.regex(
/[^A-Za-z0-9]/,
"Must contain at least one special character"
),

mobileNumber: z
.string()
.regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),

collegeName: z
.string()
.min(2, "College name is required"),

degree: z
.string()
.min(1, "Please select a degree"),

semester: z
.string()
.min(1, "Please select a year/semester"),
});

export type StudentRegisterSchema =
z.infer<typeof studentRegisterSchema>;
