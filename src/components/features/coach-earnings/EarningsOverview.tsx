import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, Clock, Wallet } from "lucide-react";

interface EarningsOverviewProps {
  thisMonth: {
    total: number;
    sessions: number;
  };
  pending: {
    total: number;
    sessions: number;
  };
}

export function EarningsOverview({ thisMonth, pending }: EarningsOverviewProps) {
  const total = thisMonth.total + pending.total;
  const currentMonthName = new Date().toLocaleDateString("fr-FR", {
    month: "long",
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Ce mois */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-green-700">
            {formatPrice(thisMonth.total)}
          </div>
          <div className="text-sm text-green-600 mt-1">Ce mois</div>
          <div className="text-xs text-green-500 mt-1">
            ({thisMonth.sessions} séance{thisMonth.sessions > 1 ? "s" : ""})
          </div>
        </CardContent>
      </Card>

      {/* En attente */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-orange-100">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-700">
            {formatPrice(pending.total)}
          </div>
          <div className="text-sm text-orange-600 mt-1">En attente</div>
          <div className="text-xs text-orange-500 mt-1">
            ({pending.sessions} séance{pending.sessions > 1 ? "s" : ""} à venir)
          </div>
        </CardContent>
      </Card>

      {/* Total */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-blue-100">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-700">
            {formatPrice(total)}
          </div>
          <div className="text-sm text-blue-600 mt-1">Total</div>
          <div className="text-xs text-blue-500 mt-1 capitalize">
            {currentMonthName}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
