// Background service worker — relays messages between content scripts
// and the popup, since they cannot communicate directly.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CAPTURED_DRAFT") {
    // Store the latest draft so the popup can read it when opened
    chrome.storage.local.set({ latestDraft: message.payload });
  }
  if (message.type === "OPEN_POPUP") {
    // Chrome only honors this within the user gesture's transient
    // activation window, which doesn't always survive the hop from
    // content script to service worker. If it's rejected, the draft is
    // still saved above, so the user can open the popup manually instead.
    chrome.action.openPopup().catch(() => {});
  }
  sendResponse({ received: true });
});
