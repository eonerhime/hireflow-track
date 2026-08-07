// app/reset-password/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/schemas/auth";

export const dynamic = "force-dynamic";

const inputClass = `mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
    text-sm shadow-sm bg-white text-gray-900
    focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
    dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100
    dark:focus:border-blue-400 dark:focus:ring-blue-400`;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (response.status === 200) {
        router.push("/login?reset=true");
        return;
      }

      setServerError(json.error ?? "Something went wrong. Please try again.");
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        This reset link is missing or malformed.{" "}
        <a
          href="/forgot-password"
          className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          Request a new one
        </a>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <input type="hidden" {...register("token")} value={token} />

      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
          className={inputClass}
        />
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          className={inputClass}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium
                   text-white hover:bg-blue-700 disabled:opacity-50
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600
                   dark:focus:ring-offset-gray-800"
      >
        {isLoading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 gap-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800 dark:border dark:border-gray-700">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Choose a new password
        </h1>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
