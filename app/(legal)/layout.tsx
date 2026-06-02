import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth/next";
import Image from "next/image";
import Link from "next/link";

export default async function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Fetch the session on the server
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  const backHref = isLoggedIn ? "dashboard" : "login";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/hireflow-horizontal.png"
              alt="HireFlow-Track"
              width={140}
              height={36}
              className="dark:hidden"
              priority
            />
            <Image
              src="/hireflow-horizontal-dark.png"
              alt="HireFlow-Track"
              width={140}
              height={36}
              className="hidden dark:block"
              priority
            />
          </Link>

          {/* This link now accurately points backwards or to a smart default */}
          <Link
            href={`/${backHref}`}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            ← Back to {backHref.at(0)?.toUpperCase() + backHref.slice(1)}
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">{children}</main>

      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400 dark:text-gray-500">
          <span>© {new Date().getFullYear()} HireTrace</span>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
