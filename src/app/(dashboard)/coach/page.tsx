import { getCurrentDbUser, getClerkUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCoachDashboardData } from "@/actions/coach-dashboard.actions";
import { CoachDashboard } from "@/components/features/coach-dashboard";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace coach | TrustCoach",
  description: "Gérez votre activité de coaching",
};

export default async function CoachDashboardPage() {
  // Vérifier d'abord si l'utilisateur est connecté à Clerk
  const clerkUserId = await getClerkUserId();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  // Récupérer ou créer le profil Prisma
  const user = await getCurrentDbUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement de votre profil...</p>
        <p className="text-sm text-muted-foreground">
          Si cette page persiste, essayez de vous{" "}
          <a href="/sign-in" className="text-primary underline">
            reconnecter
          </a>
        </p>
      </div>
    );
  }

  const result = await getCoachDashboardData();

  if (result.error || !result.data) {
    // L'utilisateur n'est pas coach - afficher un message clair
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-lg font-medium">Vous n&apos;avez pas de profil coach</p>
        <p className="text-muted-foreground text-center max-w-md">
          {result.error || "Vous devez être enregistré comme coach pour accéder à cet espace."}
        </p>
        <Link
          href="/user"
          className="text-primary underline hover:no-underline"
        >
          Retourner à mon espace utilisateur
        </Link>
      </div>
    );
  }

  return (
    <CoachDashboard
      coach={result.data.coach}
      upcomingBookings={result.data.upcomingBookings}
      monthRevenue={result.data.monthRevenue}
      monthSessions={result.data.monthSessions}
    />
  );
}
