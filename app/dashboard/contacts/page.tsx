import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ContactList from "@/components/ContactList";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const contacts = await prisma.contact.findMany({
    where: {
      application: {
        userId: session.user.id,
        deletedAt: null,
      },
    },
    include: {
      application: {
        select: { id: true, role: true, company: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Group contacts by applicationId
  type GroupedContacts = Record<
    string,
    {
      application: { id: string; role: string; company: string };
      contacts: typeof contacts;
    }
  >;

  const grouped = contacts.reduce<GroupedContacts>((acc, contact) => {
    if (!contact.application) return acc;
    const key = contact.application.id;
    if (!acc[key]) {
      acc[key] = { application: contact.application, contacts: [] };
    }
    acc[key].contacts.push(contact);
    return acc;
  }, {});

  const groups = Object.values(grouped);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Contacts
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {contacts.length === 0
            ? "No contacts yet"
            : `${contacts.length} contact${contacts.length === 1 ? "" : "s"} across ${groups.length} application${groups.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* Empty state */}
      {groups.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No contacts yet. Open an application and add contacts there.
          </p>
          <Link
            href="/dashboard/applications"
            className="mt-3 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Go to Applications →
          </Link>
        </div>
      )}

      {/* Grouped cards */}
      {groups.map(({ application, contacts: groupContacts }) => (
        <div
          key={application.id}
          className="rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800 overflow-hidden"
        >
          {/* Application header */}
          <div
            className="flex items-center justify-between px-5 py-3
                          border-b border-gray-100 dark:border-gray-700
                          bg-gray-50 dark:bg-gray-900/40"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {application.role}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {application.company}
              </p>
            </div>
            <Link
              href={`/dashboard/applications/${application.id}`}
              className="text-xs text-blue-600 hover:underline dark:text-blue-400 shrink-0"
            >
              View application →
            </Link>
          </div>

          {/* Contacts for this application */}
          <div className="px-5 py-2">
            <ContactList contacts={groupContacts} showApplication={false} />
          </div>
        </div>
      ))}
    </div>
  );
}
