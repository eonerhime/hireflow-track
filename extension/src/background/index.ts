// Background service worker — relays messages between content scripts
// and the popup, since they cannot communicate directly.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CAPTURED_DRAFT") {
    // Store the latest draft so the popup can read it when opened
    chrome.storage.local.set({ latestDraft: message.payload });
  }
  sendResponse({ received: true });
});
