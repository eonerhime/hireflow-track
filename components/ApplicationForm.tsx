// components/ApplicationForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  createApplicationSchema,
  CreateApplicationInput,
  CreateApplicationFormInput,
} from "@/lib/schemas/application";

interface ApplicationFormProps {
  mode: "create" | "edit";
  applicationId?: string;
  defaultValues?: Partial<CreateApplicationFormInput>;
  onSuccess?: () => void;
}

export default function ApplicationForm({
  mode,
  applicationId,
  defaultValues,
  onSuccess,
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
        router.push("/dashboard");
        router.refresh();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Company */}
      <div>
        <label
          htmlFor="company"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Company <span className="text-red-500">*</span>
        </label>
        <input
          id="company"
          {...register("company")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
               focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Acme Corp"
        />
        {errors.company && (
          <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>
        )}
      </div>

      {/* Role */}
      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Role <span className="text-red-500">*</span>
        </label>
        <input
          id="role"
          {...register("role")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
               focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Senior Frontend Engineer"
        />
        {errors.role && (
          <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
        )}
      </div>

      {/* Location + Salary (two-column) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location
          </label>
          <input
            id="location"
            {...register("location")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Remote / London"
          />
        </div>
        <div>
          <label
            htmlFor="salary"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Salary
          </label>
          <input
            id="salary"
            {...register("salary")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="£60,000 – £80,000"
          />
        </div>
      </div>

      {/* Job URL */}
      <div>
        <label
          htmlFor="jobUrl"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Job URL
        </label>
        <input
          id="jobUrl"
          {...register("jobUrl")}
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="https://..."
        />
        {errors.jobUrl && (
          <p className="mt-1 text-xs text-red-600">{errors.jobUrl.message}</p>
        )}
      </div>

      {/* Follow-up date */}
      <div>
        <label
          htmlFor="followUpAt"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Follow-up Date
        </label>
        <input
          id="followUpAt"
          {...register("followUpAt")}
          type="date"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes
        </label>
        <textarea
          id="notes"
          {...register("notes")}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Recruiter name, interview format, anything relevant..."
        />
      </div>

      {/* Source */}
      <div>
        <label
          htmlFor="source"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Source
        </label>
        <select
          id="source"
          {...register("source")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
               focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
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
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                     focus:ring-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
      </div>

      {/* Resume Version */}
      <div>
        <label
          htmlFor="resumeVersionLabel"
          className="block text-sm font-medium text-gray-700"
        >
          Resume version
        </label>
        <input
          id="resumeVersionLabel"
          type="text"
          placeholder="e.g. Product Manager v3"
          {...register("resumeVersionLabel")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3
                    py-2 text-sm shadow-sm focus:border-blue-500
                    focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </form>
  );
}
