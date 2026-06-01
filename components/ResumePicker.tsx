// components/ResumePicker.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ResumeOption {
  id: string;
  label: string;
  fileUrl: string;
}

interface ResumePickerProps {
  applicationId: string;
  currentResumeId: string | null;
  resumes: ResumeOption[];
}

export default function ResumePicker({
  applicationId,
  currentResumeId,
  resumes,
}: ResumePickerProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(currentResumeId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (value: string) => {
    setSelected(value);
    setSaving(true);
    setError(null);

    const payload = { resumeId: value === "" ? null : value };
    console.log("PATCH payload:", payload);

    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId: value === "" ? null : value }),
    });

    if (res.ok) {
      router.refresh();
      setTimeout(() => {
        router.push(window.location.pathname + window.location.search);
      }, 100);
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to link resume");
    }

    setSaving(false);
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="resume-picker"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Linked resume
      </label>
      <select
        id="resume-picker"
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className="block w-full rounded-md border border-gray-300 px-3
                   py-2 text-sm shadow-sm bg-white text-gray-900
                   focus:border-blue-500 focus:outline-none focus:ring-1
                   focus:ring-blue-500 disabled:opacity-50
                   dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100
                   dark:focus:border-blue-400 dark:focus:ring-blue-400"
      >
        <option value="">— None —</option>
        {resumes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
