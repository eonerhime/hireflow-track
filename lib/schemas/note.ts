// lib/schemas/note.ts
import { z } from "zod";
import { ApplicationStage } from "@prisma/client";

export const createNoteSchema = z.object({
  stage: z.nativeEnum(ApplicationStage),
  content: z.string().min(1, "Note content is required"),
});

export const updateNoteSchema = z
  .object({
    stage: z.nativeEnum(ApplicationStage).optional(),
    content: z.string().min(1, "Note content is required").optional(),
  })
  .refine((data) => data.stage !== undefined || data.content !== undefined, {
    message: "At least one field must be provided",
  });

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
