import { formatPrice } from "@/lib/utils";
import { TrendingUp, Calendar } from "lucide-react";

interface QuickStatsProps {
  monthRevenue: number;
  monthSessions: number;
}

export function QuickStats({ monthRevenue, monthSessions }: QuickStatsProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-4 px-6 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp className="h-4 w-4 text-green-600" />
        <span className="text-muted-foreground">Ce mois :</span>
        <span className="font-semibold">{formatPrice(monthRevenue)}</span>
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-blue-600" />
        <span className="font-semibold">{monthSessions}</span>
        <span className="text-muted-foreground">
          séance{monthSessions > 1 ? "s" : ""} réalisée{monthSessions > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
