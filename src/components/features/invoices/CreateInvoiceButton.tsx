"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { createInvoice } from "@/actions/invoice.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CreateInvoiceButtonProps {
  bookingId: string;
}

export function CreateInvoiceButton({ bookingId }: CreateInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setLoading(true);
    try {
      const result = await createInvoice({ bookingId });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Facture créée");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCreate} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <FileText className="h-4 w-4 mr-1" />
      )}
      {loading ? "Création..." : "Générer facture"}
    </Button>
  );
}
