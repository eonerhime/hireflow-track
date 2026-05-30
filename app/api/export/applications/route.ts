import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// CSV helpers — no external library needed
function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToCsv(row: unknown[]): string {
  return row.map(escapeCsv).join(",");
}

const HEADERS = [
  "Company",
  "Role",
  "Stage",
  "Location",
  "Salary",
  "Source",
  "Applied At",
  "Follow-up Date",
  "Resume Version Label",
  "Linked Resume",
  "Contacts",
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: userId, deletedAt: null },
      include: {
        contacts: { select: { name: true, email: true } },
        resume: { select: { label: true } },
      },
      orderBy: { appliedAt: "desc" },
    });

    const rows = applications.map((app) => {
      const contactsSummary = app.contacts
        .map((c) => `${c.name}${c.email ? ` <${c.email}>` : ""}`)
        .join("; ");

      return rowToCsv([
        app.company,
        app.role,
        app.stage,
        app.location,
        app.salary,
        app.source,
        app.appliedAt.toISOString().split("T")[0],
        app.followUpAt ? app.followUpAt.toISOString().split("T")[0] : null,
        app.resumeVersionLabel,
        app.resume?.label ?? null,
        contactsSummary || null,
      ]);
    });

    const csv = [rowToCsv(HEADERS), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="applications.csv"',
      },
    });
  } catch (error) {
    console.error("[GET /api/export/applications]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
