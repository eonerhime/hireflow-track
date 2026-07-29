import { useState, useEffect } from "react";
import Settings from "./Settings";
import CaptureButton from "./CaptureButton";
import ReviewForm from "./ReviewForm";
import { getApiKey } from "../lib/storage";

interface Draft {
  company: string;
  role: string;
  location: string;
  jobUrl: string;
  source: "linkedin" | "manual";
}

export default function App() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    getApiKey().then((key) => setConnected(!!key));

    // Pick up a draft captured by the LinkedIn content script, if any
    chrome.storage.local.get("latestDraft", (result) => {
      if (result.latestDraft) {
        setDraft(result.latestDraft);
        chrome.storage.local.remove("latestDraft");
      }
    });
  }, []);

  if (connected === null) {
    return <div className="p-4 text-sm text-gray-500">Loading...</div>;
  }

  if (!connected) {
    return <Settings onConnected={() => setConnected(true)} />;
  }

  if (draft) {
    return <ReviewForm draft={draft} />;
  }

  return (
    <div className="p-4 space-y-3 w-90">
      <p className="text-sm text-gray-600">
        Open a job posting, then use the button below or the floating capture
        button on LinkedIn.
      </p>
      <CaptureButton onCaptured={setDraft} />
    </div>
  );
}
