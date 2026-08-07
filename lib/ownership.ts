// lib/ownership.ts
//
// Shared ownership-check helpers for resources scoped to the authenticated
// user, either directly (Application has userId) or via a relation
// (Contact/InterviewNote have no userId of their own, only applicationId).
// Consolidates what was previously 4+ near-duplicate inline queries across
// route handlers, each with subtly different guarantees.
import { prisma } from "@/lib/prisma";

export function getOwnedApplication(userId: string, applicationId: string) {
  return prisma.application.findFirst({
    where: { id: applicationId, userId, deletedAt: null },
  });
}

export function getOwnedContact(userId: string, contactId: string) {
  return prisma.contact.findFirst({
    where: { id: contactId, application: { userId, deletedAt: null } },
  });
}

export function getOwnedNote(userId: string, noteId: string) {
  return prisma.interviewNote.findFirst({
    where: { id: noteId, application: { userId, deletedAt: null } },
  });
}
