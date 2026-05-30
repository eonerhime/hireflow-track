// app/api/dashboard/metrics/route.ts
import { authOptions } from "@/lib/auth-options";

import { prisma } from "@/lib/prisma";
import { ApplicationStage } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const INTERVIEW_OR_BEYOND = ["INTERVIEW", "ASSESSMENT", "OFFER", "CLOSED"];
const OFFER_OR_BEYOND = ["OFFER", "CLOSED"];

const STAGE_ORDER: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "CLOSED",
];

type StageTotals = Record<string, { totalDays: number; count: number }>;
type SourceTotals = Record<
  string,
  { total: number; interviews: number; offers: number }
>;

/**
 * GET /api/dashboard/metrics
 * Auth: Required (JWT cookie)
 *
 * Returns aggregated pipeline metrics for the authenticated user's applications.
 *
 * Response shape:
 *   {
 *     conversionRates: { appliedToInterview: number, interviewToOffer: number },
 *     timeInStage:     { stage: ApplicationStage, avgDays: number }[],
 *     sourceEffectiveness: {
 *       source: string, total: number, interviews: number, offers: number,
 *       interviewRate: number, offerRate: number
 *     }[]
 *   }
 *
 * Notes:
 *   - conversionRates values are whole-number percentages (0–100)
 *   - timeInStage is ordered by STAGE_ORDER; stages with no applications are omitted
 *   - Applications with no source are grouped under "UNTAGGED"
 *
 * Responses:
 *   200 — Metrics object
 *   401 — Unauthorized { error }
 *   500 — Internal server error { error }
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const applications = await prisma.application.findMany({
      where: { userId: userId, deletedAt: null },
      select: { stage: true, stageEnteredAt: true, source: true },
    });

    const total = applications.length;
    const atInterviewOrBeyond = applications.filter((a) =>
      INTERVIEW_OR_BEYOND.includes(a.stage),
    ).length;
    const atOfferOrBeyond = applications.filter((a) =>
      OFFER_OR_BEYOND.includes(a.stage),
    ).length;

    const appliedToInterview =
      total === 0 ? 0 : Math.round((atInterviewOrBeyond / total) * 100);
    const interviewToOffer =
      atInterviewOrBeyond === 0
        ? 0
        : Math.round((atOfferOrBeyond / atInterviewOrBeyond) * 100);

    // Time-in-stage
    const now = Date.now();
    const stageTotals: StageTotals = {};
    for (const app of applications) {
      if (!app.stageEnteredAt) continue;
      const days =
        (now - new Date(app.stageEnteredAt).getTime()) / (1000 * 60 * 60 * 24);
      if (!stageTotals[app.stage])
        stageTotals[app.stage] = { totalDays: 0, count: 0 };
      stageTotals[app.stage].totalDays += days;
      stageTotals[app.stage].count += 1;
    }
    const timeInStage = STAGE_ORDER.filter((s) => stageTotals[s]).map((s) => ({
      stage: s,
      avgDays: Math.round(stageTotals[s].totalDays / stageTotals[s].count),
    }));

    // Source effectiveness
    const sourceTotals: SourceTotals = {};
    for (const app of applications) {
      const key = app.source ?? "UNTAGGED";
      if (!sourceTotals[key])
        sourceTotals[key] = { total: 0, interviews: 0, offers: 0 };
      sourceTotals[key].total += 1;
      if (INTERVIEW_OR_BEYOND.includes(app.stage))
        sourceTotals[key].interviews += 1;
      if (OFFER_OR_BEYOND.includes(app.stage)) sourceTotals[key].offers += 1;
    }
    const sourceEffectiveness = Object.entries(sourceTotals).map(
      ([source, counts]) => ({
        source,
        total: counts.total,
        interviews: counts.interviews,
        offers: counts.offers,
        interviewRate:
          counts.total === 0
            ? 0
            : Math.round((counts.interviews / counts.total) * 100),
        offerRate:
          counts.total === 0
            ? 0
            : Math.round((counts.offers / counts.total) * 100),
      }),
    );

    return NextResponse.json({
      conversionRates: { appliedToInterview, interviewToOffer },
      timeInStage,
      sourceEffectiveness,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/metrics]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
