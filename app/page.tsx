// app/page.tsx
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HireTrace — Organize and Track Your Job Applications",
  description:
    "Take control of your job search with HireTrace. Track application statuses, manage tailored resumes, organize company contacts, and never miss a follow-up.",
  metadataBase: new URL("https://hiretrace-ten.vercel.app/"),
  openGraph: {
    title: "HireTrace — Organize and Track Your Job Applications",
    description:
      "Take control of your job search with HireTrace. Track application statuses, manage tailored resumes, organize company contacts, and never miss a follow-up.",
    url: "https://hiretrace-ten.vercel.app/",
    siteName: "HireTrace",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HireTrace — Personal Job Application Tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HireTrace — Organize and Track Your Job Applications",
    description:
      "Take control of your job search with HireTrace. Track application statuses, manage tailored resumes, organize company contacts, and never miss a follow-up.",
    images: ["/og-image.jpg"],
  },
};

export default function Home() {
  redirect("/dashboard");

  return null;
}
