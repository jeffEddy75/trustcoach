import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCoachClients } from "@/actions/coach-clients.actions";
import { ClientList } from "@/components/features/coach-clients";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes clients | TrustCoach",
  description: "Gérez vos clients de coaching",
};

export default async function CoachClientsPage() {
  const user = await getCurrentDbUser();

  if (!user) {
    redirect("/sign-in");
  }

  const result = await getCoachClients();

  if (result.error || !result.data) {
    redirect("/user");
  }

  return (
    <ClientList
      clients={result.data.clients}
      totalClients={result.data.totalClients}
    />
  );
}
