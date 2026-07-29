"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import ApiKeyCard from "./ApiKeyCard";

// ── Schemas ────────────────────────────────────────────────────
const profileSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface SettingsClientProps {
  email: string;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export default function SettingsClient({
  email,
  avatarUrl: initialAvatarUrl,
  firstName: initialFirstName,
  lastName: initialLastName,
}: SettingsClientProps) {
  const { update: updateSession } = useSession();

  // ── Avatar state ───────────────────────────────────────────
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialAvatarUrl ?? null,
  );
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Profile name form ──────────────────────────────────────
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialFirstName ?? "",
      lastName: initialLastName ?? "",
    },
  });

  // ── Password form ──────────────────────────────────────────
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  // Initials fallback
  const initials = email ? email[0].toUpperCase() : "?";

  // ── Avatar upload ──────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setAvatarError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/settings/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Upload failed");
      }

      const { avatarUrl: newUrl } = await res.json();
      setAvatarUrl(newUrl);
      await updateSession();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setAvatarError(message);
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── Profile name save ──────────────────────────────────────
  async function onProfileSubmit(data: ProfileFormData) {
    setProfileError(null);
    setProfileSuccess(false);

    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setProfileError(body.error ?? "Something went wrong");
      return;
    }

    setProfileSuccess(true);
    await updateSession();
  }

  // ── Password save ──────────────────────────────────────────
  async function onPasswordSubmit(data: PasswordFormData) {
    setPwError(null);
    setPwSuccess(false);

    const res = await fetch("/api/settings/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      setPwError(body.error ?? "Something went wrong");
      return;
    }

    setPwSuccess(true);
    reset();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account
        </p>
      </div>

      {/* ── Profile card — avatar only ────────────────────── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Profile
        </h2>

        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile photo"
                width={80}
                height={80}
                className="rounded-full object-cover ring-2 ring-blue-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-blue-500">
                <span className="text-2xl font-bold text-white">
                  {initials}
                </span>
              </div>
            )}

            {avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Upload button */}
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              disabled={avatarUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-fit px-4 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {avatarUploading ? "Uploading…" : "Upload photo"}
            </button>
            {avatarError && (
              <p className="text-xs text-red-400">{avatarError}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Account card — email + editable name ─────────── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Account
        </h2>

        {/* Email — read only */}
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Email
          </p>
          <p className="text-sm text-gray-900 dark:text-white mt-0.5">
            {email}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Email cannot be changed.
          </p>
        </div>

        {/* Name fields */}
        <form
          onSubmit={handleProfileSubmit(onProfileSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First name
              </label>
              <input
                type="text"
                {...registerProfile("firstName")}
                placeholder="First name"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {profileErrors.firstName && (
                <p className="text-xs text-red-400 mt-1">
                  {profileErrors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last name
              </label>
              <input
                type="text"
                {...registerProfile("lastName")}
                placeholder="Last name"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {profileErrors.lastName && (
                <p className="text-xs text-red-400 mt-1">
                  {profileErrors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {profileError && (
            <p className="text-sm text-red-400">{profileError}</p>
          )}
          {profileSuccess && (
            <p className="text-sm text-green-400">Name updated successfully.</p>
          )}

          <button
            type="submit"
            disabled={profileSubmitting}
            className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {profileSubmitting ? "Saving…" : "Save name"}
          </button>
        </form>
      </div>

      {/* ── NEW: Browser Extension card ───────────────────── */}
      <ApiKeyCard />

      {/* ── Change Password card ──────────────────────────── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Change Password
        </h2>

        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current password
            </label>
            <input
              type="password"
              {...register("currentPassword")}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-400 mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New password
            </label>
            <input
              type="password"
              {...register("newPassword")}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.newPassword && (
              <p className="text-xs text-red-400 mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {pwError && <p className="text-sm text-red-400">{pwError}</p>}
          {pwSuccess && (
            <p className="text-sm text-green-400">
              Password updated successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Saving…" : "Save password"}
          </button>
        </form>
      </div>
    </div>
  );
}
