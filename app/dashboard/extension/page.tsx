import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import ApiKeyCard from "@/components/ApiKeyCard";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "Download the extension",
    body: "Download the HireFlow Capture package below.",
    action: {
      href: "/downloads/hireflow-capture-extension.zip",
      label: "Download extension (.zip)",
    },
  },
  {
    title: "Unzip it",
    body: "Extract the downloaded file to a folder you'll keep around — Chrome loads the extension from this folder, so don't delete it afterward.",
  },
  {
    title: "Open chrome://extensions",
    body: "In Chrome, go to chrome://extensions (paste that into your address bar).",
  },
  {
    title: "Turn on Developer mode",
    body: "Toggle “Developer mode” on, in the top-right corner of that page.",
  },
  {
    title: "Load unpacked",
    body: "Click “Load unpacked” and select the unzipped folder. The HireFlow Capture icon should appear in your toolbar.",
  },
  {
    title: "Connect it to your account",
    body: "Generate an API key below, then paste it into the extension's popup to connect it.",
  },
] as const;

export default async function ExtensionGuidePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Get the HireFlow Capture extension
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Save job postings from LinkedIn or any job page directly into your
          pipeline.
        </p>
      </div>

      <ol className="space-y-4">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {step.body}
                </p>
                {"action" in step && step.action && (
                  <a
                    href={step.action.href}
                    className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    {step.action.label}
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <ApiKeyCard />
    </div>
  );
}
