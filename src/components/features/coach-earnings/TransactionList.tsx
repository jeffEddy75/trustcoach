import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Receipt, Check, Clock, X, RotateCcw } from "lucide-react";
import type { Transaction } from "@/actions/coach-earnings.actions";

interface TransactionListProps {
  transactions: Transaction[];
}

const statusConfig: Record<
  Transaction["status"],
  { label: string; icon: React.ReactNode; className: string }
> = {
  COMPLETED: {
    label: "Payé",
    icon: <Check className="h-3 w-3" />,
    className: "bg-green-100 text-green-800",
  },
  CONFIRMED: {
    label: "À venir",
    icon: <Clock className="h-3 w-3" />,
    className: "bg-orange-100 text-orange-800",
  },
  CANCELLED: {
    label: "Annulé",
    icon: <X className="h-3 w-3" />,
    className: "bg-gray-100 text-gray-800",
  },
  REFUNDED: {
    label: "Remboursé",
    icon: <RotateCcw className="h-3 w-3" />,
    className: "bg-red-100 text-red-800",
  },
};

export function TransactionList({ transactions }: TransactionListProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Dernières transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Aucune transaction
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => {
              const status = statusConfig[transaction.status];

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-muted-foreground w-16">
                      {formatDate(transaction.date)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {transaction.clientName || transaction.clientEmail}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Séance #{transaction.sessionNumber}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-medium ${
                        transaction.status === "REFUNDED"
                          ? "text-red-600"
                          : "text-foreground"
                      }`}
                    >
                      {transaction.status === "REFUNDED" ? "-" : ""}
                      {formatPrice(transaction.amount)}
                    </span>
                    <Badge variant="secondary" className={status.className}>
                      {status.icon}
                      <span className="ml-1">{status.label}</span>
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
