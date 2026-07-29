"use client";

import { useState } from "react";

export default function ApiKeyCard() {
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/api-key", { method: "POST" });
      const data = await res.json();
      setGeneratedKey(data.apiKey);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async () => {
    await fetch("/api/settings/api-key", { method: "DELETE" });
    setGeneratedKey(null);
  };

  const handleCopy = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:border dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Browser Extension
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Generate a key to connect the HireFlow browser extension to your
        account.
      </p>

      {generatedKey ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-md bg-amber-50 dark:bg-amber-900/30 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
            Copy this key now — it will not be shown again.
          </div>
          <div className="flex gap-2">
            <code className="flex-1 truncate rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-xs text-gray-800 dark:text-gray-200">
              {generatedKey}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            type="button"
            onClick={handleRevoke}
            className="text-sm text-red-600 hover:underline dark:text-red-400"
          >
            Revoke key
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Generating..." : "Generate API Key"}
        </button>
      )}
    </div>
  );
}
