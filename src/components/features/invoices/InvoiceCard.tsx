"use client";

import { useState } from "react";
import type { InvoiceWithRelations } from "@/actions/invoice.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, Download, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  issueInvoice,
  markInvoiceAsSent,
  deleteInvoiceDraft,
} from "@/actions/invoice.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface InvoiceCardProps {
  invoice: InvoiceWithRelations;
}

const statusConfig = {
  DRAFT: {
    label: "Brouillon",
    variant: "secondary" as const,
    icon: "📝",
  },
  ISSUED: {
    label: "Émise",
    variant: "default" as const,
    icon: "📤",
  },
  SENT: {
    label: "Envoyée",
    variant: "outline" as const,
    icon: "✅",
  },
};

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const status = statusConfig[invoice.status];

  const handleDownload = () => {
    window.open(`/api/invoices/${invoice.id}/pdf`, "_blank");
  };

  const handleIssue = async () => {
    setLoading("issue");
    try {
      const result = await issueInvoice(invoice.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Facture émise");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSend = async () => {
    setLoading("send");
    try {
      // TODO: Implémenter l'envoi par email
      const result = await markInvoiceAsSent(invoice.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Facture marquée comme envoyée");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer ce brouillon ?")) return;
    setLoading("delete");
    try {
      const result = await deleteInvoiceDraft(invoice.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Brouillon supprimé");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-muted rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{invoice.number}</span>
                <Badge variant={status.variant}>
                  {status.icon} {status.label}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {invoice.clientName} •{" "}
                {(invoice.amountTTC / 100).toFixed(2).replace(".", ",")} €
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(invoice.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>

            {invoice.status === "DRAFT" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleIssue}
                  disabled={loading === "issue"}
                >
                  {loading === "issue" && (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  Finaliser
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading === "delete"}
                >
                  {loading === "delete" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </>
            )}

            {invoice.status === "ISSUED" && (
              <Button
                size="sm"
                onClick={handleSend}
                disabled={loading === "send"}
              >
                {loading === "send" ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Envoyer
              </Button>
            )}

            {invoice.status === "SENT" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSend}
                disabled={loading === "send"}
              >
                Renvoyer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
