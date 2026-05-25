// lib/schemas/resume.ts
import { z } from "zod";

export const createResumeSchema = z.object({
  label: z.string().min(1, "Label is required"),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;

export const linkResumeSchema = z.object({
  resumeId: z.string().nullable().optional(),
});

export type LinkResumeInput = z.infer<typeof linkResumeSchema>;
