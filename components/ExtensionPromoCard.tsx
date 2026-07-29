import Link from "next/link";

export default function ExtensionPromoCard() {
  return (
    <Link
      href="/dashboard/extension"
      className="flex items-center justify-between gap-4 rounded-xl border
                 border-indigo-200 bg-indigo-50 px-6 py-4 transition-colors
                 hover:bg-indigo-100 dark:border-indigo-900
                 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70"
    >
      <div>
        <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
          Get the HireFlow Capture extension
        </p>
        <p className="mt-0.5 text-sm text-indigo-700 dark:text-indigo-300">
          Save jobs from LinkedIn (or any job page) straight into your
          pipeline, without switching tabs.
        </p>
      </div>
      <span className="shrink-0 whitespace-nowrap text-sm font-medium text-indigo-700 dark:text-indigo-300">
        View install guide →
      </span>
    </Link>
  );
}
