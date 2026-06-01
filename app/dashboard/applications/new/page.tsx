// app/dashboard/applications/new/page.tsx
import ApplicationForm from "@/components/ApplicationForm";

export default function NewApplicationPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Add Application
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track a new job application in your pipeline.
        </p>
      </div>
      <div
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm
                      dark:border-gray-700 dark:bg-gray-800"
      >
        <ApplicationForm mode="create" />
      </div>
    </main>
  );
}
