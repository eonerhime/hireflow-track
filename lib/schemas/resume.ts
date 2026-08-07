// lib/schemas/resume.ts
import { z } from "zod";

export const createResumeSchema = z.object({
  label: z.string().min(1, "Label is required"),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
