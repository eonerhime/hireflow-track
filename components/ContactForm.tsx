// components/ContactForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createContactSchema, CreateContactInput } from "@/lib/schemas/contact";
import { useRouter } from "next/navigation";

interface ContactFormProps {
  applicationId: string;
  onSuccess?: () => void;
}

export default function ContactForm({
  applicationId,
  onSuccess,
}: ContactFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateContactInput>({
    resolver: zodResolver(createContactSchema),
    defaultValues: { applicationId },
  });

  const onSubmit = async (data: CreateContactInput) => {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      reset();
      router.refresh();
      onSuccess?.();
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("applicationId")} />

      <div>
        <label htmlFor="name" className={labelClass}>
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          {...register("name")}
          className={inputClass}
          placeholder="Jane Smith"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contactRole" className={labelClass}>
          Role
        </label>
        <input
          id="contactRole"
          {...register("role")}
          className={inputClass}
          placeholder="Hiring Manager"
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          {...register("email")}
          type="email"
          className={inputClass}
          placeholder="jane@acme.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone
        </label>
        <input
          id="phone"
          {...register("phone")}
          className={inputClass}
          placeholder="+44 7700 900000"
        />
      </div>

      <div>
        <label htmlFor="contactNotes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="contactNotes"
          {...register("notes")}
          rows={3}
          className={inputClass}
          placeholder="Met at interview, very responsive..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium
                     text-white hover:bg-indigo-700 disabled:opacity-50
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400"
        >
          {isSubmitting ? "Saving…" : "Add Contact"}
        </button>
      </div>
    </form>
  );
}
