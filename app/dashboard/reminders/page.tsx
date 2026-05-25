import Link from "next/link";
import { cookies } from "next/headers";
import ReminderList from "@/components/ReminderList";

async function getReminders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hiretrace-token")?.value;

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/reminders`, {
    headers: { Cookie: `hiretrace-token=${token}` },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function RemindersPage() {
  const reminders = await getReminders();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Reminders</h1>
      <ReminderList reminders={reminders} />
    </div>
  );
}
