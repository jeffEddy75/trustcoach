import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import type { MonthlyEarning } from "@/actions/coach-earnings.actions";

interface MonthlyChartProps {
  monthlyHistory: MonthlyEarning[];
}

export function MonthlyChart({ monthlyHistory }: MonthlyChartProps) {
  // Trouver le maximum pour normaliser les barres
  const maxTotal = Math.max(...monthlyHistory.map((m) => m.total), 1);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Historique (6 mois)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {monthlyHistory.map((month) => {
          const percentage = (month.total / maxTotal) * 100;

          return (
            <div key={month.month.toISOString()} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">
                  {formatMonth(month.month)}
                </span>
                <span className="font-medium">{formatPrice(month.total)}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {month.sessions} séance{month.sessions > 1 ? "s" : ""}
              </div>
            </div>
          );
        })}

        {monthlyHistory.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            Aucune donnée disponible
          </div>
        )}
      </CardContent>
    </Card>
  );
}
