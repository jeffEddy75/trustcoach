"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportEarningsCSV } from "@/actions/coach-earnings.actions";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const result = await exportEarningsCSV();

      if (result.error || !result.data) {
        toast.error(result.error || "Erreur lors de l'export");
        return;
      }

      // Créer et télécharger le fichier CSV
      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `revenus_${new Date().getFullYear()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Export téléchargé !");
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      Exporter CSV
    </Button>
  );
}
