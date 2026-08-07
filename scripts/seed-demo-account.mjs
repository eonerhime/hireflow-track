// scripts/seed-demo-account.mjs
//
// Populates an EXISTING user account with realistic synthetic data for use
// as a public-facing demo. Never copies real user data — every company,
// contact, and resume file here is fabricated for this purpose.
//
// Usage:
//   node scripts/seed-demo-account.mjs <email>
//
// Safety: refuses to run if the account already has any applications, so
// re-running this script is a no-op rather than a source of duplicates.

import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/seed-demo-account.mjs <email>");
  process.exit(1);
}

// ---- tiny deterministic RNG so re-runs are reproducible if ever needed ----
function makeRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
const rng = makeRng(42);
function pick(arr) {
  return arr[Math.floor(rng() * arr.length)];
}
function pickMany(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}
function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
function daysFromNow(n) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

// ---- minimal, valid, hand-built PDF (no external dependency needed) ----
function buildPdf(title, bodyLines) {
  const objects = [];
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
  objects.push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`,
  );

  // The content stream's text strings use Helvetica's default single-byte
  // encoding, not UTF-8 — non-ASCII characters (em-dashes, curly quotes,
  // etc.) render as garbage glyphs, so sanitize before writing.
  const toPdfText = (s) =>
    s
      .replace(/[()\\]/g, "")
      .replace(/[‒-―]/g, "-")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[^\x20-\x7e]/g, "");

  const lines = [
    `BT`,
    `/F1 20 Tf`,
    `72 720 Td`,
    `(${toPdfText(title)}) Tj`,
    `/F1 11 Tf`,
  ];
  bodyLines.forEach((line, i) => {
    lines.push(`0 ${i === 0 ? -40 : -18} Td`);
    lines.push(`(${toPdfText(line)}) Tj`);
  });
  lines.push(`ET`);
  const streamBytes = lines.join("\n") + "\n";

  objects.push(
    `4 0 obj\n<< /Length ${Buffer.byteLength(streamBytes)} >>\nstream\n${streamBytes}endstream\nendobj\n`,
  );
  objects.push(
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
  );

  let body = `%PDF-1.4\n`;
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(body));
    body += obj;
  }
  const xrefStart = Buffer.byteLength(body);
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(body + xref + trailer, "utf-8");
}

function uploadPdf(buffer, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "raw", folder: "resumes", format: "pdf", public_id: publicId },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result);
        },
      )
      .end(buffer);
  });
}

// ---- synthetic content pools (all fictional) ----
const COMPANIES = [
  "Nimbus Analytics", "Fernbridge Robotics", "Solace Health", "Cobalt Systems",
  "Vantage Cloud", "Meridian Labs", "Brightline Media", "Kestrel Finance",
  "Lumen Dynamics", "Northwind Software", "Pinecrest Studios", "Anchorpoint Logistics",
  "Thistledown Design", "Ridgeline Analytics", "Fablehaus Games", "Circuitry Works",
  "Harborlight Consulting", "Greenfield Robotics", "Stratus Cloud Co", "Ravenwood Systems",
  "Coppertail Media", "Skylark Ventures", "Ironwood Tech", "Tidewell Health",
  "Junction Analytics", "Palisade Security",
];
const ROLES = [
  "Senior Frontend Engineer", "Full Stack Developer", "Product Manager",
  "UX Designer", "Backend Engineer (Node.js)", "DevOps Engineer",
  "Data Analyst", "Engineering Manager", "Mobile Developer (React Native)",
  "QA Engineer", "Technical Writer", "Solutions Architect",
  "Growth Marketing Manager", "Customer Success Manager", "Site Reliability Engineer",
];
const LOCATIONS = [
  "Remote", "Lagos, Nigeria (Hybrid)", "London, UK (Remote)", "Berlin, Germany (On-site)",
  "Austin, TX (Remote)", "Toronto, Canada (Hybrid)", "Remote (US timezones)",
  "Amsterdam, Netherlands (Hybrid)", "Nairobi, Kenya (On-site)",
];
const SOURCES = ["LinkedIn", "Referral", "Company Website", "Indeed", "AngelList"];
const FIRST_NAMES = ["Ada", "Chidi", "Priya", "Marcus", "Elena", "Tomás", "Yuki", "Sofia"];
const LAST_NAMES = ["Okafor", "Mensah", "Larsson", "Ibrahim", "Fernandez", "Kowalski", "Adeyemi"];
const CONTACT_ROLES = ["Recruiter", "Hiring Manager", "Talent Partner", "Engineering Lead"];

const STAGE_PLAN = [
  { stage: "APPLIED", count: 8 },
  { stage: "SCREENING", count: 6 },
  { stage: "INTERVIEW", count: 4 },
  { stage: "ASSESSMENT", count: 3 },
  { stage: "OFFER", count: 2 },
  { stage: "CLOSED", count: 3 },
];

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found for ${email}. Register the account first, then re-run this script.`);
    process.exit(1);
  }

  const existingCount = await prisma.application.count({ where: { userId: user.id } });
  if (existingCount > 0) {
    console.error(
      `This account already has ${existingCount} application(s) — refusing to seed again to avoid duplicates.`,
    );
    process.exit(1);
  }

  console.log(`Seeding demo data for ${email} (${user.id})...`);

  // ---- Resumes (real uploaded PDFs) ----
  const resumeSpecs = [
    { label: "Software Engineer — General", lines: ["A generalist resume covering full-stack web development.", "This is placeholder content generated for the public HireFlow demo."] },
    { label: "Product Manager — Tailored", lines: ["Tailored for product management roles.", "This is placeholder content generated for the public HireFlow demo."] },
    { label: "Frontend Specialist — 2026", lines: ["Focused on frontend engineering and design systems.", "This is placeholder content generated for the public HireFlow demo."] },
    { label: "Design Portfolio Resume", lines: ["Highlights UX design case studies.", "This is placeholder content generated for the public HireFlow demo."] },
  ];

  const resumes = [];
  for (const spec of resumeSpecs) {
    const pdf = buildPdf(spec.label, spec.lines);
    const uploadResult = await uploadPdf(pdf, `demo-${user.id}-${resumes.length}`);
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        label: spec.label,
        fileUrl: uploadResult.secure_url,
        fileKey: uploadResult.public_id,
      },
    });
    resumes.push(resume);
  }
  console.log(`Created ${resumes.length} resumes (uploaded to Cloudinary).`);

  // ---- Applications ----
  const usedCompanies = pickMany(COMPANIES, STAGE_PLAN.reduce((n, s) => n + s.count, 0));
  let companyIdx = 0;
  const applications = [];
  const activityEntries = [];

  for (const { stage, count } of STAGE_PLAN) {
    for (let i = 0; i < count; i++) {
      const company = usedCompanies[companyIdx++];
      const role = pick(ROLES);
      const appliedDaysAgo = 5 + Math.floor(rng() * 65);
      const appliedAt = daysAgo(appliedDaysAgo);
      const stageEnteredAt =
        stage === "APPLIED" ? appliedAt : daysAgo(Math.max(1, appliedDaysAgo - Math.floor(rng() * 20)));
      const hasFollowUp = stage !== "CLOSED" && rng() < 0.4;
      const followUpAt = hasFollowUp
        ? rng() < 0.5
          ? daysAgo(Math.floor(rng() * 5)) // overdue
          : daysFromNow(1 + Math.floor(rng() * 10)) // upcoming
        : null;
      const linkedResume = rng() < 0.6 ? pick(resumes) : null;

      const application = await prisma.application.create({
        data: {
          userId: user.id,
          company,
          role,
          location: pick(LOCATIONS),
          jobUrl: `https://jobs.example.com/${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/${role.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          stage,
          appliedAt,
          stageEnteredAt,
          followUpAt,
          source: pick(SOURCES),
          resumeId: linkedResume?.id ?? null,
          resumeVersionLabel: linkedResume?.label ?? null,
          createdAt: appliedAt,
        },
      });
      applications.push(application);

      activityEntries.push({
        userId: user.id,
        applicationId: application.id,
        action: "APPLICATION_CREATED",
        metadata: { company, role },
        createdAt: appliedAt,
      });
      if (linkedResume) {
        activityEntries.push({
          userId: user.id,
          applicationId: application.id,
          action: "RESUME_LINKED",
          metadata: { company, role },
          createdAt: appliedAt,
        });
      }
      if (stage !== "APPLIED") {
        activityEntries.push({
          userId: user.id,
          applicationId: application.id,
          action: "STAGE_CHANGED",
          metadata: { company, role, toStage: stage },
          createdAt: stageEnteredAt,
        });
      }
    }
  }
  console.log(`Created ${applications.length} applications.`);

  // ---- Contacts ----
  const contactTargets = pickMany(
    applications.filter((a) => a.stage !== "APPLIED"),
    10,
  );
  let contactCount = 0;
  for (const application of contactTargets) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    await prisma.contact.create({
      data: {
        applicationId: application.id,
        name: `${first} ${last}`,
        role: pick(CONTACT_ROLES),
        email: `${first.toLowerCase()}.${last.toLowerCase()}@examplecorp.com`,
        phone: `+1-555-01${String(10 + contactCount).padStart(2, "0")}`,
      },
    });
    contactCount++;
  }
  console.log(`Created ${contactCount} contacts.`);

  // ---- Interview notes ----
  const noteTargets = applications.filter((a) =>
    ["INTERVIEW", "ASSESSMENT", "OFFER", "CLOSED"].includes(a.stage),
  );
  const NOTE_TEMPLATES = {
    SCREENING: "Recruiter screen went well — discussed background and salary expectations.",
    INTERVIEW: "Technical interview covered system design and a live coding exercise. Panel seemed engaged.",
    ASSESSMENT: "Take-home assessment submitted — focused on API design and test coverage.",
    OFFER: "Verbal offer received — reviewing compensation details before responding.",
    CLOSED: "Process closed. Kept notes for reference in future applications.",
  };
  let noteCount = 0;
  for (const application of noteTargets) {
    const content = NOTE_TEMPLATES[application.stage] ?? "Notes from this stage of the process.";
    const createdAt = daysAgo(Math.max(1, Math.floor(rng() * 20)));
    await prisma.interviewNote.create({
      data: {
        applicationId: application.id,
        stage: application.stage,
        content,
        createdAt,
      },
    });
    activityEntries.push({
      userId: user.id,
      applicationId: application.id,
      action: "NOTE_ADDED",
      metadata: { company: application.company, role: application.role },
      createdAt,
    });
    noteCount++;

    // A couple of applications get a second, earlier note for realism
    if (rng() < 0.3 && application.stage !== "SCREENING") {
      const earlierContent = NOTE_TEMPLATES.SCREENING;
      const earlierCreatedAt = daysAgo(Math.floor(rng() * 30) + 20);
      await prisma.interviewNote.create({
        data: {
          applicationId: application.id,
          stage: "SCREENING",
          content: earlierContent,
          createdAt: earlierCreatedAt,
        },
      });
      activityEntries.push({
        userId: user.id,
        applicationId: application.id,
        action: "NOTE_ADDED",
        metadata: { company: application.company, role: application.role },
        createdAt: earlierCreatedAt,
      });
      noteCount++;
    }
  }
  console.log(`Created ${noteCount} interview notes.`);

  // ---- Activity log ----
  await prisma.activityLog.createMany({ data: activityEntries });
  console.log(`Created ${activityEntries.length} activity log entries.`);

  console.log("\nDone. Summary:");
  console.log({
    applications: applications.length,
    contacts: contactCount,
    notes: noteCount,
    resumes: resumes.length,
    activity: activityEntries.length,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
