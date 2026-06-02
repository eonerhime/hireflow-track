// app/page.tsx
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "HireFlow — A smart application to trace and manage your job applications effectively",
  description:
    "Take control of your job search with HireFlow. Track application statuses, manage tailored resumes, organize company contacts, and never miss a follow-up.",
  metadataBase: new URL("https://hireflow-track.vercel.app/"),
  openGraph: {
    title:
      "HireFlow — A smart application to trace and manage your job applications effectively",
    description:
      "Take control of your job search with HireFlow. Track application statuses, manage tailored resumes, organize company contacts, and never miss a follow-up.",
    url: "https://hireflow-track.vercel.app/",
    siteName: "HireFlow",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HireFlow — Personal Job Application Tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HireFlow — Organize and Track Your Job Applications",
    description:
      "Take control of your job search with HireFlow. Track application statuses, manage tailored resumes, organize company contacts, and never miss a follow-up.",
    images: ["/og-image.jpg"],
  },
};

export default function Home() {
  redirect("/dashboard");

  return null;
}
