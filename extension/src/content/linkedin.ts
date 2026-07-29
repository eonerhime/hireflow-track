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

// Walks up a fixed number of ancestors to find a "nearby" container for
// scoping secondary lookups (company, location) around a confirmed anchor
// element, without depending on LinkedIn's obfuscated class names.
function climbAncestors(el: Element, levels: number): Element {
  let node = el;
  for (let i = 0; i < levels && node.parentElement; i++) {
    node = node.parentElement;
  }
  return node;
}

function extractJobDetails(): CapturedDraft | null {
  try {
    // The job title isn't necessarily an h1 — on search/split-pane layouts
    // (/jobs/search/) it's the link to the canonical /jobs/view/{id}/ page.
    // That page also carries the selected job's id as ?currentJobId=, so we
    // match the title link to that id rather than grabbing the first
    // /jobs/view/ link on the page (the results list has one per card).
    const url = new URL(window.location.href);
    const viewMatch = url.pathname.match(/\/jobs\/view\/(\d+)/);
    const jobId = url.searchParams.get("currentJobId") ?? viewMatch?.[1];

    const titleLink = jobId
      ? document.querySelector<HTMLAnchorElement>(
          `a[href*="/jobs/view/${jobId}/"]`,
        )
      : document.querySelector<HTMLAnchorElement>('a[href*="/jobs/view/"]');
    const role = titleLink?.textContent?.trim();
    if (!titleLink || !role) return null;

    // Canonical job URL — derived from the title link itself, not
    // window.location, since the search/split-pane URL is the search
    // listing's URL, not the specific job's.
    const hrefUrl = new URL(titleLink.href, window.location.origin);
    const jobUrl = `${hrefUrl.origin}${hrefUrl.pathname}`;

    // Company/location: scope to a container near the title link so we
    // don't pick up an unrelated /company/ link elsewhere on the page,
    // falling back to a page-wide search if nothing is found nearby.
    const scope = climbAncestors(titleLink, 6);
    const companyLink =
      scope.querySelector<HTMLAnchorElement>('a[href*="/company/"]') ??
      document.querySelector<HTMLAnchorElement>('a[href*="/company/"]');
    const company = companyLink?.textContent?.trim();
    if (!company) return null;

    const locationEl = scope.querySelector('[class*="job-details"] span[dir="ltr"]');
    const location = locationEl?.textContent?.trim() ?? "";

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
    left: 24px;
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
