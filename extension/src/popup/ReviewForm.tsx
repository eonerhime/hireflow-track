import { useState } from "react";
import { getApiKey } from "../lib/storage";

interface Draft {
  company: string;
  role: string;
  location: string;
  jobUrl: string;
  source: "linkedin" | "manual";
}

type SubmitState = "idle" | "loading" | "success" | "duplicate" | "error";

const API_BASE = "https://hireflow-track.vercel.app";

export default function ReviewForm({ draft }: { draft: Draft }) {
  const [form, setForm] = useState(draft);
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [resultLink, setResultLink] = useState<string | null>(null);

  const handleSubmit = async () => {
    setState("loading");
    const apiKey = await getApiKey();

    try {
      const res = await fetch(`${API_BASE}/api/extension/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ ...form, notes: notes || undefined }),
      });

      const json = await res.json();

      if (res.status === 201) {
        setState("success");
        setResultLink(`${API_BASE}/dashboard/applications/${json.id}`);
      } else if (res.status === 409) {
        setState("duplicate");
        setResultLink(
          `${API_BASE}/dashboard/applications/${json.applicationId}`,
        );
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  if (state === "success" || state === "duplicate") {
    return (
      <div className="p-4 space-y-2">
        <p className="text-sm font-medium text-gray-900">
          {state === "success" ? "Saved to HireFlow." : "Already tracked."}
        </p>
        <a
          href={resultLink ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          View in dashboard →
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700">
          Company
        </label>
        <input
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Role</label>
        <input
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">
          Location
        </label>
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>

      {state === "error" && (
        <p className="text-xs text-red-600">
          Something went wrong. Check your API key in settings and try again.
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={state === "loading" || !form.company || !form.role}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {state === "loading" ? "Saving..." : "Save to HireFlow"}
      </button>
    </div>
  );
}
