// app/dashboard/layout.tsx
import SidebarNav from "@/components/SidebarNav";
import NotificationBell from "@/components/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userName = session.user.name ?? session.user.email ?? "User";
  const userEmail = session.user.email ?? "";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <SidebarNav userName={userName} userEmail={userEmail} />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header
          className="flex h-16 shrink-0 items-center justify-end gap-3
                           border-b border-gray-200 dark:border-gray-700
                           bg-white dark:bg-gray-900 lg:px-8 px-6"
        >
          {/* Spacer on mobile so hamburger (fixed) doesn't overlap content */}
          <div className="flex-1 lg:hidden" />
          <ThemeToggle />
          <NotificationBell />
          <LogoutButton />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
