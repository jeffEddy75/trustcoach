"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  addAvailabilitySchema,
  type AddAvailabilityInput,
} from "@/validations/availability.schema";
import type { ActionResult } from "@/types";
import type { Availability } from "@prisma/client";

/**
 * Récupérer les disponibilités du coach connecté
 */
export async function getAvailabilitiesAction(): Promise<
  ActionResult<Availability[]>
> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { data: null, error: "Non authentifié" };
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      include: {
        availabilities: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!coach) {
      return { data: null, error: "Profil coach non trouvé" };
    }

    return { data: coach.availabilities, error: null };
  } catch (error) {
    console.error("[GET_AVAILABILITIES_ERROR]", error);
    return { data: null, error: "Erreur lors de la récupération des disponibilités" };
  }
}

/**
 * Ajouter une disponibilité
 */
export async function addAvailabilityAction(
  data: AddAvailabilityInput
): Promise<ActionResult<Availability>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { data: null, error: "Non authentifié" };
    }

    if (session.user.role !== "COACH" && session.user.role !== "ADMIN") {
      return { data: null, error: "Accès non autorisé" };
    }

    // Valider les données
    const validated = addAvailabilitySchema.parse(data);

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return { data: null, error: "Profil coach non trouvé" };
    }

    // Vérifier les chevauchements
    const existingSlots = await prisma.availability.findMany({
      where: {
        coachId: coach.id,
        dayOfWeek: validated.dayOfWeek,
      },
    });

    const hasOverlap = existingSlots.some((slot) => {
      // Vérifier si le nouveau créneau chevauche un existant
      return (
        (validated.startTime >= slot.startTime && validated.startTime < slot.endTime) ||
        (validated.endTime > slot.startTime && validated.endTime <= slot.endTime) ||
        (validated.startTime <= slot.startTime && validated.endTime >= slot.endTime)
      );
    });

    if (hasOverlap) {
      return {
        data: null,
        error: "Ce créneau chevauche une disponibilité existante",
      };
    }

    // Créer la disponibilité
    const availability = await prisma.availability.create({
      data: {
        coachId: coach.id,
        dayOfWeek: validated.dayOfWeek,
        startTime: validated.startTime,
        endTime: validated.endTime,
      },
    });

    return { data: availability, error: null };
  } catch (error) {
    console.error("[ADD_AVAILABILITY_ERROR]", error);
    return { data: null, error: "Erreur lors de l'ajout de la disponibilité" };
  }
}

/**
 * Supprimer une disponibilité
 */
export async function deleteAvailabilityAction(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { data: null, error: "Non authentifié" };
    }

    if (session.user.role !== "COACH" && session.user.role !== "ADMIN") {
      return { data: null, error: "Accès non autorisé" };
    }

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return { data: null, error: "Profil coach non trouvé" };
    }

    // Vérifier que la disponibilité appartient au coach
    const availability = await prisma.availability.findUnique({
      where: { id },
    });

    if (!availability) {
      return { data: null, error: "Disponibilité non trouvée" };
    }

    if (availability.coachId !== coach.id) {
      return { data: null, error: "Accès non autorisé" };
    }

    // Supprimer
    await prisma.availability.delete({
      where: { id },
    });

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("[DELETE_AVAILABILITY_ERROR]", error);
    return { data: null, error: "Erreur lors de la suppression" };
  }
}

/**
 * Remplacer toutes les disponibilités (mise à jour en lot)
 */
export async function updateAllAvailabilitiesAction(
  availabilities: AddAvailabilityInput[]
): Promise<ActionResult<Availability[]>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { data: null, error: "Non authentifié" };
    }

    if (session.user.role !== "COACH" && session.user.role !== "ADMIN") {
      return { data: null, error: "Accès non autorisé" };
    }

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return { data: null, error: "Profil coach non trouvé" };
    }

    // Valider toutes les disponibilités
    const validatedSlots = availabilities.map((slot) =>
      addAvailabilitySchema.parse(slot)
    );

    // Transaction : supprimer tout et recréer
    const result = await prisma.$transaction(async (tx) => {
      // Supprimer toutes les disponibilités existantes
      await tx.availability.deleteMany({
        where: { coachId: coach.id },
      });

      // Créer les nouvelles
      if (validatedSlots.length > 0) {
        await tx.availability.createMany({
          data: validatedSlots.map((slot) => ({
            coachId: coach.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        });
      }

      // Retourner les nouvelles disponibilités
      return tx.availability.findMany({
        where: { coachId: coach.id },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      });
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("[UPDATE_ALL_AVAILABILITIES_ERROR]", error);
    return { data: null, error: "Erreur lors de la mise à jour des disponibilités" };
  }
}
