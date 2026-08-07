// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/schemas/auth";

export const dynamic = "force-dynamic";

const inputClass = `mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
    text-sm shadow-sm bg-white text-gray-900
    focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
    dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100
    dark:focus:border-blue-400 dark:focus:ring-blue-400`;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } finally {
      // Always show the same confirmation, regardless of outcome — the API
      // itself never reveals whether the email exists either.
      setSubmitted(true);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 gap-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800 dark:border dark:border-gray-700">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Reset your password
        </h1>

        {submitted ? (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            If an account exists for that email, we&apos;ve sent a password
            reset link. It expires in 1 hour.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4 mt-6"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={inputClass}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium
                       text-white hover:bg-blue-700 disabled:opacity-50
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600
                       dark:focus:ring-offset-gray-800"
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <a
            href="/login"
            className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to log in
          </a>
        </p>
      </div>
    </main>
  );
}
