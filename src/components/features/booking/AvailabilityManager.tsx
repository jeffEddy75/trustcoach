"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  addAvailabilityAction,
  deleteAvailabilityAction,
} from "@/actions/availability.actions";
import type { Availability } from "@prisma/client";
import { Clock, Plus, Trash2, Loader2 } from "lucide-react";

interface AvailabilityManagerProps {
  initialAvailabilities: Availability[];
}

const DAY_NAMES = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return [`${hour}:00`, `${hour}:30`];
}).flat();

export function AvailabilityManager({
  initialAvailabilities,
}: AvailabilityManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state for new availability
  const [selectedDay, setSelectedDay] = useState<string>("1");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("12:00");

  // Group availabilities by day
  const availabilitiesByDay: Record<number, Availability[]> = {};
  for (const av of initialAvailabilities) {
    const daySlots = availabilitiesByDay[av.dayOfWeek];
    if (!daySlots) {
      availabilitiesByDay[av.dayOfWeek] = [av];
    } else {
      daySlots.push(av);
    }
  }

  const handleAddAvailability = () => {
    if (endTime <= startTime) {
      toast.error("L'heure de fin doit être après l'heure de début");
      return;
    }

    startTransition(async () => {
      const result = await addAvailabilityAction({
        dayOfWeek: parseInt(selectedDay, 10),
        startTime,
        endTime,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Disponibilité ajoutée");
      setIsDialogOpen(false);
      router.refresh();
    });
  };

  const handleDeleteAvailability = (id: string) => {
    startTransition(async () => {
      const result = await deleteAvailabilityAction(id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Disponibilité supprimée");
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-heading flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Disponibilités récurrentes
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une disponibilité</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Jour</Label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_NAMES.map((name, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Début</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fin</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.filter((time) => time > startTime).map(
                        (time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button onClick={handleAddAvailability} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {initialAvailabilities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucune disponibilité configurée.
            <br />
            Ajoutez vos créneaux pour permettre aux clients de réserver.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Display days in order: Lundi to Dimanche */}
            {[1, 2, 3, 4, 5, 6, 0].map((day) => {
              const slots = availabilitiesByDay[day];
              if (!slots || slots.length === 0) return null;

              return (
                <div key={day} className="flex items-start gap-4">
                  <span className="w-24 text-sm font-medium pt-1">
                    {DAY_NAMES[day]}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <Badge
                        key={slot.id}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {slot.startTime} - {slot.endTime}
                        <button
                          onClick={() => handleDeleteAvailability(slot.id)}
                          disabled={isPending}
                          className="ml-1 p-0.5 hover:bg-destructive/20 rounded"
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </Badge>
                    ))}
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
