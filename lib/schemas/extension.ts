import { z } from "zod";

export const extensionApplicationSchema = z.object({
  company: z.string().min(1, "Company is required").max(200),
  role: z.string().min(1, "Role is required").max(200),
  location: z.string().max(200).optional(),
  jobUrl: z.string().url("Must be a valid URL"),
  source: z.enum(["linkedin", "manual"]),
  notes: z.string().max(2000).optional(),
});

export type ExtensionApplicationInput = z.infer<
  typeof extensionApplicationSchema
>;
