"use server";

import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

export type HealthStatus = "active" | "review" | "new" | "inactive";

export interface CoachClient {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  healthStatus: HealthStatus;
  totalSessions: number;
  lastSessionDate: Date | null;
  nextSessionDate: Date | null;
  currentGoal: string | null;
  hasUnreadMessages: boolean;
}

interface CoachClientsData {
  clients: CoachClient[];
  totalClients: number;
}

/**
 * Calcule le statut de santé d'un coaching
 */
function calculateHealthStatus(
  completedCount: number,
  lastSessionDate: Date | null,
  nextSessionDate: Date | null
): HealthStatus {
  // Nouveau client (0 séances complétées)
  if (completedCount === 0) {
    return "new";
  }

  const now = new Date();

  // Si prochaine séance planifiée, toujours actif
  if (nextSessionDate && nextSessionDate > now) {
    return "active";
  }

  // Calculer les jours depuis la dernière séance
  if (lastSessionDate) {
    const daysSinceLastSession =
      (now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24);

    // Plus de 2 mois = inactif
    if (daysSinceLastSession > 60) {
      return "inactive";
    }

    // Plus de 2 semaines sans prochaine séance = à revoir
    if (daysSinceLastSession > 14) {
      return "review";
    }
  }

  return "active";
}

/**
 * Récupère la liste des clients du coach avec leur statut de santé
 */
export async function getCoachClients(): Promise<ActionResult<CoachClientsData>> {
  try {
    const user = await getCurrentDbUser();

    if (!user) {
      return { data: null, error: "Non authentifié" };
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: user.id },
    });

    if (!coach) {
      return { data: null, error: "Vous n'êtes pas coach" };
    }

    const now = new Date();

    // Récupérer tous les utilisateurs qui ont au moins un booking avec ce coach
    const usersWithBookings = await prisma.user.findMany({
      where: {
        bookings: {
          some: {
            coachId: coach.id,
          },
        },
      },
      include: {
        bookings: {
          where: { coachId: coach.id },
          orderBy: { scheduledAt: "desc" },
          select: {
            id: true,
            status: true,
            scheduledAt: true,
          },
        },
      },
    });

    // Traiter chaque client
    const clients: CoachClient[] = await Promise.all(
      usersWithBookings.map(async (client) => {
        // Compter les séances complétées
        const completedBookings = client.bookings.filter(
          (b) => b.status === "COMPLETED"
        );
        const totalSessions = completedBookings.length;

        // Dernière séance complétée
        const lastCompletedBooking = completedBookings[0];
        const lastSessionDate = lastCompletedBooking?.scheduledAt ?? null;

        // Prochaine séance confirmée
        const nextBooking = client.bookings.find(
          (b) => b.status === "CONFIRMED" && b.scheduledAt > now
        );
        const nextSessionDate = nextBooking?.scheduledAt ?? null;

        // Calculer le statut de santé
        const healthStatus = calculateHealthStatus(
          totalSessions,
          lastSessionDate,
          nextSessionDate
        );

        // Vérifier les messages non lus
        let hasUnreadMessages = false;
        try {
          const conversation = await prisma.conversation.findFirst({
            where: {
              coachId: coach.id,
              userId: client.id,
            },
          });

          if (conversation?.lastMessagePreview) {
            const lastMessage = await prisma.chatMessage.findFirst({
              where: {
                conversationId: conversation.id,
              },
              orderBy: { createdAt: "desc" },
            });
            hasUnreadMessages = lastMessage?.senderRole === "USER";
          }
        } catch {
          // Ignorer les erreurs de messagerie
        }

        return {
          id: client.id,
          name: client.name,
          email: client.email,
          image: client.image,
          healthStatus,
          totalSessions,
          lastSessionDate,
          nextSessionDate,
          currentGoal: null, // TODO: implémenter les objectifs si nécessaire
          hasUnreadMessages,
        };
      })
    );

    // Trier par statut de santé (à revoir > nouveau > actif > inactif)
    const statusOrder: Record<HealthStatus, number> = {
      review: 0,
      new: 1,
      active: 2,
      inactive: 3,
    };

    clients.sort((a, b) => {
      const statusDiff = statusOrder[a.healthStatus] - statusOrder[b.healthStatus];
      if (statusDiff !== 0) return statusDiff;
      // Puis par dernière séance (plus récent en premier)
      if (a.lastSessionDate && b.lastSessionDate) {
        return b.lastSessionDate.getTime() - a.lastSessionDate.getTime();
      }
      return 0;
    });

    return {
      data: {
        clients,
        totalClients: clients.length,
      },
      error: null,
    };
  } catch (error) {
    console.error("[GET_COACH_CLIENTS_ERROR]", error);
    return { data: null, error: "Erreur lors du chargement des clients" };
  }
}
