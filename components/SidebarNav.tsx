// components/SidebarNav.tsx
"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// ── Icons ───────────────────────────────────────────────────────────────────
function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function KanbanIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
      />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

// ── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: GridIcon },
  {
    label: "Applications",
    href: "/dashboard/applications",
    icon: BriefcaseIcon,
  },
  { label: "Pipeline", href: "/dashboard/pipeline", icon: KanbanIcon },
  { label: "Contacts", href: "/dashboard/contacts", icon: UsersIcon },
  { label: "Reminders", href: "/dashboard/reminders", icon: BellIcon },
  { label: "Analytics", href: "/dashboard/analytics", icon: ChartIcon },
  { label: "Documents", href: "/dashboard/resumes", icon: FileIcon },
  { label: "Settings", href: "/dashboard/settings", icon: GearIcon },
];

// ── Sidebar content ──────────────────────────────────────────────────────────
function SidebarContent({
  onNavClick,
}: {
  userName: string;
  userEmail: string;
  onNavClick?: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Derive display name
  const displayName =
    session?.user?.firstName && session?.user?.lastName
      ? `${session.user.firstName} ${session.user.lastName}`
      : session?.user?.firstName
        ? session.user.firstName
        : (session?.user?.email ?? "");

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-6 h-16 ">
        <Image
          src="/hiretrace-horizontal.png"
          alt="HireTrace"
          width={140}
          height={40}
          quality={75}
          className="h-auth w-auto dark:hidden"
        />
        <Image
          src="/hiretrace-horizontal-dark.png"
          alt="HireTrace"
          width={140}
          height={40}
          quality={75}
          className="h-auth w-auto hidden dark:block"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm
                          font-medium transition-colors
                          ${
                            isActive
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                          }`}
            >
              <item.icon
                className={`h-4 w-4 shrink-0 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center gap-3">
          {session?.user?.avatarUrl ? (
            <Image
              src={session.user.avatarUrl}
              alt="Profile photo"
              width={32}
              height={32}
              className="rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center
                   rounded-full bg-blue-600 text-sm font-bold text-white"
            >
              {displayName[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="min-w-0">
            {/* Only render name line if a name exists */}
            {(session?.user?.firstName || session?.user?.lastName) && (
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {displayName}
              </p>
            )}
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
interface SidebarNavProps {
  userName: string;
  userEmail: string;
}

export default function SidebarNav({ userName, userEmail }: SidebarNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar — hidden on mobile ── */}
      <aside
        className="hidden lg:flex h-screen w-64 shrink-0 flex-col
                        border-r border-gray-200 dark:border-gray-700
                        bg-white dark:bg-gray-900"
      >
        <SidebarContent userName={userName} userEmail={userEmail} />
      </aside>

      {/* ── Mobile: hamburger button (rendered in top bar via portal-free approach) ── */}
      {/* This button is placed here but floats into the header via the layout */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-4 left-4 z-40 rounded-md p-2
                   bg-white dark:bg-gray-900 border border-gray-200
                   dark:border-gray-700 shadow-sm"
      >
        <MenuIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <aside
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col
                        bg-white dark:bg-gray-900 border-r border-gray-200
                        dark:border-gray-700 shadow-xl"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 rounded-md p-1.5
                         text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <XIcon className="h-5 w-5" />
            </button>

            <SidebarContent
              userName={userName}
              userEmail={userEmail}
              onNavClick={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}
    </>
  );
}
