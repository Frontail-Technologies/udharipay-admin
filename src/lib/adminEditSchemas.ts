import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+91 [6-9]\d{9}$/, "Enter a valid Indian phone number (+91 XXXXXXXXXX)");

const optionalPhoneSchema = z.union([
  z.literal(""),
  phoneSchema,
]);

const pincodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter a valid 6-digit pincode");

export const merchantProfileEditSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required"),
  ownerName: z.string().trim().min(2, "Owner name is required"),
  businessCategory: z.string().trim().min(2, "Category is required"),
  assignedEmployeeName: z.string().trim().min(2, "Assigned representative is required"),
  branchCount: z
    .number({ message: "Enter a branch count" })
    .int()
    .min(1, "At least 1 branch")
    .max(50, "Enter 50 or fewer branches"),
});
export type MerchantProfileEditValues = z.infer<typeof merchantProfileEditSchema>;

export const merchantContactAddressEditSchema = z.object({
  phone: phoneSchema,
  email: z.string().trim().email("Enter a valid email address"),
  addressLine1: z.string().trim().min(5, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: pincodeSchema,
});
export type MerchantContactAddressEditValues = z.infer<typeof merchantContactAddressEditSchema>;

export const merchantBankEditSchema = z.object({
  bankName: z.string().trim().min(2, "Bank name is required"),
  accountHolderName: z.string().trim().min(2, "Account holder name is required"),
  accountNumber: z.union([
    z.literal(""),
    z.string().trim().regex(/^\d{9,18}$/, "Enter a valid account number (9-18 digits)"),
  ]),
  ifsc: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code (e.g. HDFC0100000)"),
});
export type MerchantBankEditValues = z.infer<typeof merchantBankEditSchema>;

export const customerProfileEditSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: phoneSchema,
  alternatePhone: optionalPhoneSchema,
  addressLine1: z.string().trim().min(5, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: pincodeSchema,
});
export type CustomerProfileEditValues = z.infer<typeof customerProfileEditSchema>;
