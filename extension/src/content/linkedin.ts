/**
 * LinkedIn Easy Apply capture.
 *
 * LinkedIn's DOM uses obfuscated/hashed class names that change without
 * notice. Every selector below targets a STRUCTURAL pattern (ARIA roles,
 * data attributes, heading hierarchy) rather than a specific class name,
 * to reduce breakage. If LinkedIn changes their markup, this script should
 * fail silently (no button shown) rather than throw.
 */

interface CapturedDraft {
  company: string;
  role: string;
  location: string;
  jobUrl: string;
  source: "linkedin";
}

function extractJobDetails(): CapturedDraft | null {
  try {
    // Job title: LinkedIn renders this as the top heading in the job detail pane
    const titleEl = document.querySelector("h1");
    const role = titleEl?.textContent?.trim();

    // Company name: typically the first link inside the job header area
    // that points to a /company/ URL
    const companyLink = document.querySelector<HTMLAnchorElement>(
      'a[href*="/company/"]',
    );
    const company = companyLink?.textContent?.trim();

    // Location: LinkedIn tags this with an aria-label or sits near the
    // company link in a tertiary text block — best-effort
    const locationEl = document.querySelector(
      '[class*="job-details"] span[dir="ltr"]',
    );
    const location = locationEl?.textContent?.trim() ?? "";

    // Canonical job URL — strip query params LinkedIn adds for tracking
    const url = new URL(window.location.href);
    const jobUrl = `${url.origin}${url.pathname}`;

    if (!role || !company) return null;

    return { company, role, location, jobUrl, source: "linkedin" };
  } catch {
    // Never let a DOM read crash the host page
    return null;
  }
}

function injectCaptureButton() {
  if (document.getElementById("hireFlow-capture-btn")) return; // already injected

  const draft = extractJobDetails();
  if (!draft) return; // silently do nothing if we can't confidently extract

  const button = document.createElement("button");
  button.id = "hireFlow-capture-btn";
  button.textContent = "Save to HireFlow";
  button.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  `;

  button.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "CAPTURED_DRAFT", payload: draft });
    chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
  });

  document.body.appendChild(button);
}

// LinkedIn is a single-page app — content loads dynamically as the user
// navigates between job postings without a full page reload, so we need
// a MutationObserver rather than running once on load.
const observer = new MutationObserver(() => {
  injectCaptureButton();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial attempt in case the relevant DOM is already present
injectCaptureButton();
