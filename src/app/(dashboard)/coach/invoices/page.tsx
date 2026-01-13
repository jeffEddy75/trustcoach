import { getCoachInvoices } from "@/actions/invoice.actions";
import { getCurrentDbUser, getClerkUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InvoiceList } from "@/components/features/invoices";
import { Loader2, FileText } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes factures | TrustCoach",
  description: "Gérez vos factures de coaching",
};

export default async function InvoicesPage() {
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

  const result = await getCoachInvoices();

  if (result.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-lg font-medium">Erreur</p>
        <p className="text-muted-foreground">{result.error}</p>
        <Link href="/coach" className="text-primary underline">
          Retour au dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Mes factures</h1>
        </div>
      </div>

      <p className="text-muted-foreground">
        Générez des factures depuis la page{" "}
        <Link href="/coach/earnings" className="text-primary underline">
          Mes revenus
        </Link>{" "}
        pour permettre à vos clients de se faire rembourser.
      </p>

      <InvoiceList invoices={result.data ?? []} />
    </div>
  );
}
