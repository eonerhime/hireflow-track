"use client";
import { useState, useEffect } from "react";

export default function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Automatically clear the error message after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  async function handleExport() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/export/applications");
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "applications.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    // relative allows the absolute error message to position itself relative to this container
    // inline-block prevents the block wrapper from forcing button layout anomalies
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        // aria-label="Export CSV"
        className="rounded-md border border-gray-300 bg-white px-4 py-2
                   text-sm font-medium text-gray-700 shadow-sm
                   hover:bg-gray-50 disabled:opacity-50
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {loading ? "Exporting…" : "Export CSV"}
      </button>

      {error && (
        <p
          role="alert"
          // absolute: completely detaches it from the visual grid layout
          // top-full mt-1: anchors it perfectly right beneath the button boundary
          // left-0 whitespace-nowrap: keeps the message flat and un-wrapped
          className="absolute left-0 top-full mt-1 whitespace-nowrap text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
