"use client";

import type { InvoiceWithRelations } from "@/actions/invoice.actions";
import { InvoiceCard } from "./InvoiceCard";
import { FileText } from "lucide-react";

interface InvoiceListProps {
  invoices: InvoiceWithRelations[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Aucune facture générée</p>
        <p className="text-sm text-muted-foreground mt-2">
          Générez des factures depuis vos transactions pour que vos clients
          puissent se faire rembourser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <InvoiceCard key={invoice.id} invoice={invoice} />
      ))}
    </div>
  );
}
