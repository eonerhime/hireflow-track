import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, avatarUrl: true, firstName: true, lastName: true },
  });

  return (
    <SettingsClient
      email={user?.email ?? session.user.email ?? ""}
      avatarUrl={user?.avatarUrl ?? null}
      firstName={user?.firstName ?? null}
      lastName={user?.lastName ?? null}
    />
  );
}
