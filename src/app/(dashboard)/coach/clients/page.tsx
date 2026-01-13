import { getCurrentDbUser, getClerkUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCoachClients } from "@/actions/coach-clients.actions";
import { ClientList } from "@/components/features/coach-clients";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes clients | TrustCoach",
  description: "Gérez vos clients de coaching",
};

export default async function CoachClientsPage() {
  const clerkUserId = await getClerkUserId();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  const user = await getCurrentDbUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement de votre profil...</p>
      </div>
    );
  }

  const result = await getCoachClients();

  if (result.error || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-lg font-medium">Accès non autorisé</p>
        <p className="text-muted-foreground">{result.error}</p>
        <Link href="/user" className="text-primary underline">
          Retour
        </Link>
      </div>
    );
  }

  return (
    <ClientList
      clients={result.data.clients}
      totalClients={result.data.totalClients}
    />
  );
}
