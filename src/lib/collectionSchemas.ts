import { z } from "zod";

export const FOLLOW_UP_TYPE_OPTIONS = [
  { value: "call_attempted", label: "Call Attempted" },
  { value: "customer_contacted", label: "Customer Contacted" },
  { value: "reminder_sent", label: "Reminder Sent" },
  { value: "promise_to_pay", label: "Promise to Pay" },
  { value: "no_response", label: "No Response" },
  { value: "follow_up_scheduled", label: "Follow-up Scheduled" },
  { value: "note_added", label: "Note Added" },
] as const;

export const addFollowUpSchema = z
  .object({
    type: z.enum([
      "call_attempted",
      "customer_contacted",
      "reminder_sent",
      "promise_to_pay",
      "no_response",
      "follow_up_scheduled",
      "note_added",
    ]),
    note: z.string().trim().min(3, "Add a short note"),
    nextFollowUpDate: z.union([z.literal(""), z.string()]),
    promisedDate: z.union([z.literal(""), z.string()]),
  })
  .refine((data) => data.type !== "promise_to_pay" || data.promisedDate !== "", {
    message: "A promise date is required for Promise to Pay",
    path: ["promisedDate"],
  });

export type AddFollowUpValues = z.infer<typeof addFollowUpSchema>;
