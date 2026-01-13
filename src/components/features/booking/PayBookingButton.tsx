"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createPaymentSessionAction } from "@/actions/payment.actions";
import { Loader2, CreditCard } from "lucide-react";

interface PayBookingButtonProps {
  bookingId: string;
}

export function PayBookingButton({ bookingId }: PayBookingButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handlePay = () => {
    startTransition(async () => {
      const result = await createPaymentSessionAction(bookingId);

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
