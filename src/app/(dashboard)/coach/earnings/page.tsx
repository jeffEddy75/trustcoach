import { getCurrentDbUser, getClerkUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCoachEarnings } from "@/actions/coach-earnings.actions";
import {
  EarningsOverview,
  MonthlyChart,
  TransactionList,
  ExportButton,
} from "@/components/features/coach-earnings";
import { Wallet, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes revenus | TrustCoach",
  description: "Suivez vos revenus de coaching",
};

export default async function CoachEarningsPage() {
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

  const result = await getCoachEarnings();

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

  const { thisMonth, pending, monthlyHistory, recentTransactions } = result.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Mes revenus
          </h1>
          <p className="text-muted-foreground mt-1">
            Suivez vos revenus et téléchargez vos exports
          </p>
        </div>
        <ExportButton />
      </div>

      {/* Overview */}
      <EarningsOverview thisMonth={thisMonth} pending={pending} />

      {/* Grille historique + transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyChart monthlyHistory={monthlyHistory} />
        <TransactionList transactions={recentTransactions} />
      </div>
    </div>
  );
}
