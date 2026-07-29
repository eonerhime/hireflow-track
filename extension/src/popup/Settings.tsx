import { useState, useEffect } from "react";
import { getApiKey, setApiKey } from "../lib/storage";

export default function Settings({ onConnected }: { onConnected: () => void }) {
  const [keyInput, setKeyInput] = useState("");
  const [existingKey, setExistingKey] = useState<string | null>(null);

  useEffect(() => {
    getApiKey().then(setExistingKey);
  }, []);

  const handleSave = async () => {
    if (!keyInput.startsWith("htk_")) {
      alert("That doesn't look like a valid HireFlow API key.");
      return;
    }
    await setApiKey(keyInput);
    onConnected();
  };

  if (existingKey) {
    return (
      <div className="p-4 text-sm text-gray-600">Connected to HireFlow.</div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-sm text-gray-600">
        Paste your API key from HireFlow → Settings → Browser Extension.
      </p>
      <input
        type="text"
        value={keyInput}
        onChange={(e) => setKeyInput(e.target.value)}
        placeholder="htk_..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <button
        onClick={handleSave}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Connect
      </button>
    </div>
  );
}
