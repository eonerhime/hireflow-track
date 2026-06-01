// components/ApplicationForm.tsx
"use client";

import {
  CreateApplicationFormInput,
  createApplicationSchema,
} from "@/lib/schemas/application";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface ApplicationFormProps {
  mode: "create" | "edit";
  applicationId?: string;
  defaultValues?: Partial<CreateApplicationFormInput>;
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function ApplicationForm({
  mode,
  applicationId,
  defaultValues,
  onSuccess,
  redirectTo,
}: ApplicationFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateApplicationFormInput>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues,
  });

  const onSubmit = async (data: CreateApplicationFormInput) => {
    const url =
      mode === "create"
        ? "/api/applications"
        : `/api/applications/${applicationId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      if (onSuccess) {
        onSuccess();
      } else {
        if (mode === "create") {
          router.push("/dashboard");
        } else {
          router.refresh();
          await new Promise((r) => setTimeout(r, 100));
          router.push(redirectTo ?? `/dashboard/applications/${applicationId}`);
        }
      }
    }
  };

  const inputClass = `w-full rounded-md border border-gray-300 px-3 py-2 text-sm
    bg-white text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-indigo-500
    dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100
    dark:placeholder-gray-500 dark:focus:ring-indigo-400`;

  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Company */}
      <div>
        <label htmlFor="company" className={labelClass}>
          Company <span className="text-red-500">*</span>
        </label>
        <input
          id="company"
          {...register("company")}
          className={inputClass}
          placeholder="Acme Corp"
        />
        {errors.company && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.company.message}
          </p>
        )}
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className={labelClass}>
          Role <span className="text-red-500">*</span>
        </label>
        <input
          id="role"
          {...register("role")}
          className={inputClass}
          placeholder="Senior Frontend Engineer"
        />
        {errors.role && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Location + Salary (two-column) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <input
            id="location"
            {...register("location")}
            className={inputClass}
            placeholder="Remote / London"
          />
        </div>
        <div>
          <label htmlFor="salary" className={labelClass}>
            Salary
          </label>
          <input
            id="salary"
            {...register("salary")}
            className={inputClass}
            placeholder="£60,000 – £80,000"
          />
        </div>
      </div>

      {/* Job URL */}
      <div>
        <label htmlFor="jobUrl" className={labelClass}>
          Job URL
        </label>
        <input
          id="jobUrl"
          {...register("jobUrl")}
          type="text"
          className={inputClass}
          placeholder="https://..."
        />
        {errors.jobUrl && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.jobUrl.message}
          </p>
        )}
      </div>

      {/* Follow-up date */}
      <div>
        <label htmlFor="followUpAt" className={labelClass}>
          Follow-up Date
        </label>
        <input
          id="followUpAt"
          {...register("followUpAt")}
          type="date"
          className={inputClass}
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          {...register("notes")}
          rows={3}
          className={inputClass}
          placeholder="Recruiter name, interview format, anything relevant..."
        />
      </div>

      {/* Source */}
      <div>
        <label htmlFor="source" className={labelClass}>
          Source
        </label>
        <select id="source" {...register("source")} className={inputClass}>
          <option value="">— Select source —</option>
          <option value="LINKEDIN">LinkedIn</option>
          <option value="REFERRAL">Referral</option>
          <option value="COLD_APPLY">Cold Apply</option>
          <option value="JOB_BOARD">Job Board</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium
                     text-white hover:bg-indigo-700 disabled:opacity-50
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400"
        >
          {isSubmitting
            ? "Saving…"
            : mode === "create"
              ? "Add Application"
              : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium
                     text-gray-700 hover:bg-gray-50 focus:outline-none
                     focus:ring-2 focus:ring-indigo-500
                     dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700
                     dark:focus:ring-indigo-400"
        >
          Cancel
        </button>
      </div>

      {/* Resume Version */}
      <div>
        <label htmlFor="resumeVersionLabel" className={labelClass}>
          Resume version
        </label>
        <input
          id="resumeVersionLabel"
          type="text"
          placeholder="e.g. Product Manager v3"
          {...register("resumeVersionLabel")}
          className={inputClass}
        />
      </div>
    </form>
  );
}
