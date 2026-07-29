// extension/src/content/generic.ts

interface GenericDraft {
  company: string;
  role: string;
  location: string;
  jobUrl: string;
  source: "manual";
}

/**
 * Must be fully self-contained — chrome.scripting.executeScript only
 * serializes this function's own body, not any external imports or
 * module-level helpers it references. All logic must live inside.
 */
export function captureGenericPage(): GenericDraft {
  console.log(
    "[HireTrace DEBUG] captureGenericPage executing, title:",
    document.title,
  );

  const SEPARATORS = [" at ", " - ", " | ", " :: "];

  function guessFromTitle(title: string): { role: string; company: string } {
    for (const sep of SEPARATORS) {
      if (title.includes(sep)) {
        const [first, second] = title.split(sep);
        return { role: first.trim(), company: second?.trim() ?? "" };
      }
    }
    return { role: title.trim(), company: "" };
  }

  const title = document.title || "";
  const { role, company } = guessFromTitle(title);

  const draft: GenericDraft = {
    company,
    role,
    location: "",
    jobUrl: window.location.href,
    source: "manual",
  };

  console.log("[HireTrace DEBUG] Returning draft:", draft);

  return draft;
}
