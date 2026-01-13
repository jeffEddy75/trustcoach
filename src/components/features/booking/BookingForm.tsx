"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SlotPicker } from "./SlotPicker";
import { createBookingAction } from "@/actions/booking.actions";
import { createPaymentSessionAction } from "@/actions/payment.actions";
import { getInitials, formatPrice } from "@/lib/utils";
import type { Coach, User, Availability } from "@prisma/client";
import { Loader2, Video, MapPin, Clock, CreditCard, ArrowRight } from "lucide-react";

interface BookingFormProps {
  coach: Coach & { user: User; availabilities: Availability[] };
}

type BookingMode = "REMOTE" | "IN_PERSON";

export function BookingForm({ coach }: BookingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(60);
  const [mode, setMode] = useState<BookingMode>("REMOTE");
  const [step, setStep] = useState<"select" | "confirm">("select");

  const handleSlotSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Veuillez sélectionner un créneau");
      return;
    }
    setStep("confirm");
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) return;

    // Construire la date complète
    const timeParts = selectedTime.split(":");
    const hours = parseInt(timeParts[0] ?? "0", 10);
    const minutes = parseInt(timeParts[1] ?? "0", 10);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    startTransition(async () => {
      // 1. Créer la réservation
      const result = await createBookingAction({
        coachId: coach.id,
        scheduledAt,
        duration,
        mode,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      const booking = result.data;
      if (!booking) {
        toast.error("Erreur lors de la création de la réservation");
        return;
      }

      // 2. Si le prix est > 0, créer une session de paiement Stripe
      if (booking.price > 0) {
        toast.success("Réservation créée ! Redirection vers le paiement...");

        const paymentResult = await createPaymentSessionAction(booking.id);

        if (paymentResult.error) {
          toast.error(paymentResult.error);
          // Rediriger vers les réservations quand même
          router.push(`/user/bookings`);
          return;
        }

        if (paymentResult.data?.checkoutUrl) {
          // Rediriger vers Stripe Checkout
          window.location.href = paymentResult.data.checkoutUrl;
          return;
        }
      }

      // Si gratuit, rediriger directement
      toast.success("Réservation confirmée !");
      router.push(`/booking/success?booking_id=${booking.id}`);
    });
  };

  // Calculer le prix
  const price = coach.hourlyRate
    ? Math.round((coach.hourlyRate * duration) / 60)
    : 0;

  // Vérifier les modes disponibles
  const availableModes: BookingMode[] = [];
  if (coach.offersRemote) availableModes.push("REMOTE");
  if (coach.offersInPerson) availableModes.push("IN_PERSON");

  return (
    <div className="space-y-6">
      {step === "select" && (
        <>
          {/* Slot Picker */}
          <SlotPicker
            coachId={coach.id}
            availabilities={coach.availabilities}
            onSlotSelect={handleSlotSelect}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />

          {/* Options */}
          {selectedDate && selectedTime && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Durée</Label>
                    <Select
                      value={duration.toString()}
                      onValueChange={(v) => setDuration(parseInt(v, 10))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 heure</SelectItem>
                        <SelectItem value="90">1h30</SelectItem>
                        <SelectItem value="120">2 heures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Mode</Label>
                    <Select
                      value={mode}
                      onValueChange={(v) => setMode(v as BookingMode)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModes.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m === "REMOTE" ? "Visioconférence" : "Présentiel"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleContinue}
                >
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {step === "confirm" && selectedDate && selectedTime && (
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="font-heading">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Coach info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={coach.avatarUrl || coach.user.image || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {getInitials(coach.user.name || coach.user.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{coach.user.name}</p>
                <p className="text-muted-foreground">{coach.headline}</p>
              </div>
            </div>

            <Separator />

            {/* Booking details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {selectedDate.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTime} • {duration} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {mode === "REMOTE" ? (
                  <Video className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                )}
                <p className="font-medium">
                  {mode === "REMOTE" ? "Visioconférence" : "Présentiel"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium">Total à payer</p>
              </div>
              <p className="text-2xl font-bold">
                {price > 0 ? formatPrice(price) : "Gratuit"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("select")}
                disabled={isPending}
              >
                Modifier
              </Button>
              <Button
                className="flex-1"
                size="lg"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                {price > 0 ? "Payer et réserver" : "Réserver"}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              En confirmant, vous acceptez les conditions générales de vente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
