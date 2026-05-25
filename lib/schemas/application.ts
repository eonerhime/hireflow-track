// lib/schemas/application.ts
import { z } from "zod";
import { ApplicationStage } from "@prisma/client";

export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().optional(),
  salary: z.string().optional(),
  jobUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  followUpAt: z.string().optional(),
  notes: z.string().optional(),
  source: z
    .enum(["LINKEDIN", "REFERRAL", "COLD_APPLY", "JOB_BOARD", "OTHER", ""])
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  resumeVersionLabel: z.string().optional(),
});

export const updateApplicationSchema = createApplicationSchema.extend({
  company: z.string().min(1, "Company name is required").optional(),
  role: z.string().min(1, "Role is required").optional(),
  stage: z.nativeEnum(ApplicationStage).optional(),
  resumeVersionLabel: z.string().optional(),
  resumeId: z.string().nullable().optional(),
});

export const updateStageSchema = z.object({
  stage: z.nativeEnum(ApplicationStage),
});

// Output types (post-transform) — used for API payloads
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;

// Input types (pre-transform) — used for useForm generic
export type CreateApplicationFormInput = z.input<
  typeof createApplicationSchema
>;
export type UpdateApplicationFormInput = z.input<
  typeof updateApplicationSchema
>;
