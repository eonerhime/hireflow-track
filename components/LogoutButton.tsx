// components/LogoutButton.tsx
"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-md border border-gray-300 bg-white px-4 py-2
                 text-sm font-medium text-gray-700 shadow-sm
                 hover:bg-gray-50 disabled:opacity-50
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300
                 dark:hover:bg-gray-700 dark:focus:ring-blue-400"
    >
      Sign out
    </button>
  );
}
