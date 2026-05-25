// app/api/reminders/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

// Force Next.js to bypass compilation caching completely
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY!);

function buildEmailBody(
  reminders: {
    company: string;
    role: string;
    stage: string;
    followUpAt: Date;
  }[],
): string {
  const lines = reminders.map(
    (r) =>
      `• ${r.role} at ${r.company} (${r.stage}) — follow up by ${r.followUpAt.toLocaleDateString(
        "en-GB",
        { day: "numeric", month: "short", year: "numeric" },
      )}`,
  );
  return [
    "Hi,",
    "",
    "You have the following follow-ups due today in HireTrace:",
    "",
    ...lines,
    "",
    "Log in to HireTrace to take action.",
  ].join("\n");
}

/**
 * POST /api/reminders/send
 * Auth: Vercel Cron — Authorization: Bearer <CRON_SECRET>
 *
 * Sends reminder emails to users with applications where followUpAt <= today
 * and stage is not CLOSED. Groups reminders per user — one email per user.
 * Email send failures per user are logged but do not abort the batch.
 * Added to PUBLIC_API_ROUTES in middleware.ts — JWT check bypassed.
 *
 * Responses:
 * 200 — { sent: number } count of users successfully emailed
 * 401 — Unauthorized { error }
 * 500 — Internal server error { error }
 */
async function handleReminderProcessing(request: NextRequest) {
  try {
    // Validate Vercel cron Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const applications = await prisma.application.findMany({
      where: {
        deletedAt: null,
        followUpAt: { lte: today },
        stage: { not: "CLOSED" },
      },
      include: {
        user: { select: { email: true } },
      },
      orderBy: { followUpAt: "asc" },
    });

    if (applications.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    // Group applications by user email
    type AppRow = (typeof applications)[number];
    type UserMap = Record<string, AppRow[]>;

    const byUser = applications.reduce<UserMap>((acc, app) => {
      // const email = app.user.email;
      const email = "emo.onerhime@gmail.com";
      console.log(
        "Processing app for",
        email,
        "with follow-up at",
        app.followUpAt,
      );

      if (!acc[email]) acc[email] = [];
      acc[email].push(app);
      return acc;
    }, {});

    let sent = 0;

    for (const [email, userApps] of Object.entries(byUser)) {
      const count = userApps.length;
      try {
        await resend.emails.send({
          from: "HireTrace <onboarding@resend.dev>",
          to: email,
          subject: `You have ${count} follow-up${count === 1 ? "" : "s"} due today — HireTrace`,
          text: buildEmailBody(
            userApps.map((a) => ({
              company: a.company,
              role: a.role,
              stage: a.stage,
              followUpAt: a.followUpAt!,
            })),
          ),
        });
        sent += 1;
      } catch (emailError) {
        // Log but do not throw — continue sending to remaining users
        console.error(
          `[reminders/send] Failed to send to ${email}:`,
          emailError,
        );
      }
    }

    return NextResponse.json({ sent });
  } catch (error) {
    console.error("[CRON /api/reminders/send]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Explicitly export both handlers to safely accept Vercel's multi-method environment triggers
export async function GET(request: NextRequest) {
  return handleReminderProcessing(request);
}

export async function POST(request: NextRequest) {
  return handleReminderProcessing(request);
}
