"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createBookingSchema,
  type CreateBookingInput,
} from "@/validations/booking.schema";
import type { ActionResult } from "@/types";
import type { Booking, Coach, User } from "@prisma/client";

type BookingWithRelations = Booking & {
  coach: Coach & { user: User };
  user: User;
};

/**
 * Récupérer les créneaux disponibles pour un coach
 */
export async function getAvailableSlotsAction(
  coachId: string,
  date: Date
): Promise<ActionResult<{ slots: string[] }>> {
  try {
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: {
        availabilities: true,
        bookings: {
          where: {
            status: { in: ["PENDING", "CONFIRMED"] },
            scheduledAt: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999)),
            },
          },
        },
      },
    });

    if (!coach) {
      return { data: null, error: "Coach non trouvé" };
    }

    // Récupérer le jour de la semaine
    const dayOfWeek = date.getDay();

    // Filtrer les disponibilités pour ce jour
    const dayAvailabilities = coach.availabilities.filter(
      (av) => av.dayOfWeek === dayOfWeek
    );

    if (dayAvailabilities.length === 0) {
      return { data: { slots: [] }, error: null };
    }

    // Générer les créneaux disponibles (par heure)
    const availableSlots: string[] = [];
    const bookedTimes = new Set(
      coach.bookings.map((b) => {
        const d = new Date(b.scheduledAt);
        return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
      })
    );

    for (const av of dayAvailabilities) {
      const timeParts = av.startTime.split(":");
      const endParts = av.endTime.split(":");
      const startHour = parseInt(timeParts[0] ?? "0", 10);
      const startMin = parseInt(timeParts[1] ?? "0", 10);
      const endHour = parseInt(endParts[0] ?? "0", 10);
      const endMin = parseInt(endParts[1] ?? "0", 10);

      let currentHour = startHour;
      let currentMin = startMin;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMin < endMin)
      ) {
        const timeStr = `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`;

        // Vérifier si ce créneau n'est pas déjà réservé
        if (!bookedTimes.has(timeStr)) {
          availableSlots.push(timeStr);
        }

        // Avancer d'une heure
        currentHour += 1;
      }
    }

    return { data: { slots: availableSlots.sort() }, error: null };
  } catch (error) {
    console.error("[GET_AVAILABLE_SLOTS_ERROR]", error);
    return { data: null, error: "Erreur lors de la récupération des créneaux" };
  }
}

/**
 * Créer une réservation (pré-paiement)
 */
export async function createBookingAction(
  data: CreateBookingInput
): Promise<ActionResult<BookingWithRelations>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { data: null, error: "Non authentifié" };
    }

    // Valider les données
    const validated = createBookingSchema.parse(data);

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { id: validated.coachId },
      include: { user: true },
    });

    if (!coach) {
      return { data: null, error: "Coach non trouvé" };
    }

    if (!coach.verified) {
      return { data: null, error: "Ce coach n'est pas encore vérifié" };
    }

    // Vérifier que le créneau est disponible
    const scheduledDate = new Date(validated.scheduledAt);
    const dayOfWeek = scheduledDate.getDay();
    const timeStr = `${scheduledDate.getHours().toString().padStart(2, "0")}:${scheduledDate.getMinutes().toString().padStart(2, "0")}`;

    // Vérifier les disponibilités du coach
    const availability = await prisma.availability.findFirst({
      where: {
        coachId: coach.id,
        dayOfWeek,
        startTime: { lte: timeStr },
        endTime: { gt: timeStr },
      },
    });

    if (!availability) {
      return { data: null, error: "Ce créneau n'est pas dans les disponibilités du coach" };
    }

    // Vérifier qu'il n'y a pas déjà une réservation
    const existingBooking = await prisma.booking.findFirst({
      where: {
        coachId: coach.id,
        scheduledAt: scheduledDate,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingBooking) {
      return { data: null, error: "Ce créneau est déjà réservé" };
    }

    // Calculer le prix
    const price = coach.hourlyRate
      ? Math.round((coach.hourlyRate * validated.duration) / 60)
      : 0;

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        coachId: coach.id,
        scheduledAt: scheduledDate,
        duration: validated.duration,
        mode: validated.mode,
        location: validated.location,
        price,
        currency: coach.currency,
        status: "PENDING",
      },
      include: {
        coach: { include: { user: true } },
        user: true,
      },
    });

    return { data: booking, error: null };
  } catch (error) {
    console.error("[CREATE_BOOKING_ERROR]", error);
    return { data: null, error: "Erreur lors de la création de la réservation" };
  }
}

/**
 * Annuler une réservation
 */
export async function cancelBookingAction(
  bookingId: string,
  reason?: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { data: null, error: "Non authentifié" };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { coach: true },
    });

    if (!booking) {
      return { data: null, error: "Réservation non trouvée" };
    }

    // Vérifier que l'utilisateur peut annuler (propriétaire ou coach)
    const isOwner = booking.userId === session.user.id;
    const isCoach = booking.coach.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isCoach && !isAdmin) {
      return { data: null, error: "Accès non autorisé" };
    }

    // Vérifier que la réservation peut être annulée
    if (booking.status === "CANCELLED") {
      return { data: null, error: "Cette réservation est déjà annulée" };
    }

    if (booking.status === "COMPLETED") {
      return { data: null, error: "Cette séance est déjà terminée" };
    }

    // Annuler
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: session.user.id,
        cancellationReason: reason,
      },
    });

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("[CANCEL_BOOKING_ERROR]", error);
    return { data: null, error: "Erreur lors de l'annulation" };
  }
}

/**
 * Récupérer les réservations d'un utilisateur
 */
export async function getUserBookingsAction(): Promise<
  ActionResult<BookingWithRelations[]>
> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { data: null, error: "Non authentifié" };
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        coach: { include: { user: true } },
        user: true,
      },
      orderBy: { scheduledAt: "desc" },
    });

    return { data: bookings, error: null };
  } catch (error) {
    console.error("[GET_USER_BOOKINGS_ERROR]", error);
    return { data: null, error: "Erreur lors de la récupération des réservations" };
  }
}
