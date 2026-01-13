"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAvailableSlotsAction } from "@/actions/booking.actions";
import type { Availability } from "@prisma/client";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { fr } from "date-fns/locale";

interface SlotPickerProps {
  coachId: string;
  availabilities: Availability[];
  onSlotSelect: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
}

export function SlotPicker({
  coachId,
  availabilities,
  onSlotSelect,
  selectedDate,
  selectedTime,
}: SlotPickerProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [slots, setSlots] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Jours disponibles (basé sur les disponibilités récurrentes)
  const availableDays = new Set(availabilities.map((av) => av.dayOfWeek));

  // Fonction pour désactiver les jours sans disponibilité
  const isDateDisabled = (day: Date) => {
    // Pas dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day < today) return true;

    // Doit avoir une disponibilité ce jour
    return !availableDays.has(day.getDay());
  };

  // Charger les créneaux quand la date change
  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }

    startTransition(async () => {
      const result = await getAvailableSlotsAction(coachId, date);
      if (result.data) {
        setSlots(result.data.slots);
      } else {
        setSlots([]);
      }
    });
  }, [coachId, date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    // Reset selected time when date changes
    if (newDate && selectedTime) {
      onSlotSelect(newDate, "");
    }
  };

  const handleTimeSelect = (time: string) => {
    if (date) {
      onSlotSelect(date, time);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5" />
            Choisir une date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            locale={fr}
            className="rounded-md border"
          />
          {availabilities.length === 0 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Ce coach n&apos;a pas encore configuré ses disponibilités.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Time slots */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Choisir un créneau
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!date ? (
            <p className="text-muted-foreground text-center py-8">
              Sélectionnez d&apos;abord une date
            </p>
          ) : isPending ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun créneau disponible pour cette date
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          )}

          {/* Selected slot summary */}
          {date && selectedTime && (
            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <p className="text-sm font-medium">Créneau sélectionné :</p>
              <p className="text-lg font-semibold">
                {date.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                à {selectedTime}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
