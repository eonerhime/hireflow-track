// components/ResumeUploadForm.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ResumeUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !label.trim()) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("label", label.trim());

    const res = await fetch("/api/resumes", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setLabel("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Upload failed");
    }

    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="resume-label"
          className="block text-sm font-medium text-gray-700"
        >
          Label
        </label>
        <input
          id="resume-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Product Manager v3"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3
                     py-2 text-sm shadow-sm focus:border-blue-500
                     focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="resume-file"
          className="block text-sm font-medium text-gray-700"
        >
          PDF file <span className="text-gray-400">(max 5 MB)</span>
        </label>
        <input
          id="resume-file"
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm text-gray-500
                     file:mr-4 file:rounded-md file:border-0
                     file:bg-blue-50 file:px-4 file:py-2
                     file:text-sm file:font-medium file:text-blue-700
                     hover:file:bg-blue-100"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={uploading || !file || !label.trim()}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium
                   text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Upload Resume"}
      </button>
    </form>
  );
}
