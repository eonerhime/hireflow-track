import { captureGenericPage } from "../content/generic";

export default function CaptureButton({
  onCaptured,
}: {
  onCaptured: (draft: ReturnType<typeof captureGenericPage>) => void;
}) {
  const handleCapture = async () => {
    console.log("[HireTrace] Capture button clicked");

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log("[HireTrace] Active tab:", tab);

    if (!tab?.id) {
      console.log("[HireTrace] No tab id — bailing");
      return;
    }

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: captureGenericPage,
      });
      console.log("[HireTrace] executeScript results:", results);

      const result = results[0]?.result;
      console.log("[HireTrace] Extracted result:", result);

      if (!result) {
        console.log("[HireTrace] Result was falsy — bailing");
        return;
      }

      onCaptured(result);
      console.log("[HireTrace] onCaptured called");
    } catch (err) {
      console.error("[HireTrace] executeScript threw:", err);
    }
  };

  return (
    <button
      onClick={handleCapture}
      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Capture current page
    </button>
  );
}
