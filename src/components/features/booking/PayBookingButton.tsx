"use client";

import { useTransition, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createPaymentSessionAction,
  confirmBookingWithoutPaymentAction,
  isTestModeAction,
} from "@/actions/payment.actions";
import { Loader2, CreditCard, CheckCircle, AlertTriangle } from "lucide-react";

interface PayBookingButtonProps {
  bookingId: string;
}

export function PayBookingButton({ bookingId }: PayBookingButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isTestMode, setIsTestMode] = useState(false);
  const [checkingMode, setCheckingMode] = useState(true);

  useEffect(() => {
    isTestModeAction().then((result) => {
      setIsTestMode(result.data?.testMode ?? false);
      setCheckingMode(false);
    });
  }, []);

  const handlePay = () => {
    startTransition(async () => {
      const result = await createPaymentSessionAction(bookingId);

      if (result.error === "STRIPE_DISABLED") {
        // Mode test - proposer confirmation sans paiement
        setIsTestMode(true);
        return;
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data?.checkoutUrl) {
        toast.success("Redirection vers le paiement...");
        window.location.href = result.data.checkoutUrl;
      }
    });
  };

  const handleConfirmWithoutPayment = () => {
    startTransition(async () => {
      const result = await confirmBookingWithoutPaymentAction(bookingId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data?.redirectUrl) {
        toast.success("Réservation confirmée !");
        window.location.href = result.data.redirectUrl;
      }
    });
  };

  if (checkingMode) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Chargement...
      </Button>
    );
  }

  // Mode test - afficher bouton de confirmation sans paiement
  if (isTestMode) {
    return (
      <div className="space-y-3">
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Mode test</strong> - Stripe n'est pas configuré. Vous pouvez
            confirmer la réservation sans paiement.
          </AlertDescription>
        </Alert>
        <Button
          onClick={handleConfirmWithoutPayment}
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Confirmer sans paiement (test)
        </Button>
      </div>
    );
  }

  // Mode normal avec Stripe
  return (
    <Button onClick={handlePay} disabled={isPending} className="w-full">
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      Payer maintenant
    </Button>
  );
}
