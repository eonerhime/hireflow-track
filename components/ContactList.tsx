import { Contact, Application } from "@prisma/client";

type ContactWithApplication = Contact & {
  application?: Pick<Application, "id" | "role" | "company"> | null;
};

interface ContactListProps {
  contacts: ContactWithApplication[];
  showApplication?: boolean;
}

export default function ContactList({
  contacts,
  showApplication = false,
}: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No contacts yet. Add a contact to track who you spoke with.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
      {contacts.map((contact) => (
        <li key={contact.id} className="py-3 space-y-0.5">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {contact.name}
          </p>

          {contact.role && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {contact.role}
            </p>
          )}

          {showApplication && contact.application && (
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {contact.application.role} · {contact.application.company}
            </p>
          )}

          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="block text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {contact.email}
            </a>
          )}

          {contact.phone && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {contact.phone}
            </p>
          )}

          {contact.notes && (
            <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap dark:text-gray-400">
              {contact.notes}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
