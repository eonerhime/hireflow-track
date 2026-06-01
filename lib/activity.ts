import { prisma } from "@/lib/prisma";
import { ActivityAction } from "@prisma/client";

interface LogActivityParams {
  userId: string;
  applicationId?: string;
  action: ActivityAction;
  metadata?: Record<string, string | null>;
}

/**
 * Fire-and-forget activity logger.
 * Never throws — errors are logged to console only.
 * Call this after a successful mutation — never before.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        applicationId: params.applicationId ?? null,
        action: params.action,
        metadata: params.metadata ?? undefined,
      },
    });
  } catch (error) {
    console.error("[logActivity] Failed to write activity log:", error);
    // Never rethrow — logging must not affect the calling mutation
  }
}
