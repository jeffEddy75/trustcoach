"use server";

import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

interface UpcomingBooking {
  id: string;
  scheduledAt: Date;
  duration: number;
  mode: "REMOTE" | "IN_PERSON";
  price: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  session: {
    id: string;
    status: string;
    markedMoments: {
      id: string;
      timestamp: number;
      note: string | null;
    }[];
  } | null;
  sessionNumber: number;
  hasUnreadMessages: boolean;
  lastMomentNote: string | null;
}

interface DashboardData {
  coach: {
    id: string;
    name: string;
    verified: boolean;
  };
  upcomingBookings: UpcomingBooking[];
  monthRevenue: number;
  monthSessions: number;
}

/**
 * Récupère les données du dashboard coach "Focus"
 * - Séances des prochaines 48h
 * - Stats du mois
 */
export async function getCoachDashboardData(): Promise<ActionResult<DashboardData>> {
  try {
    const user = await getCurrentDbUser();

    if (!user) {
      return { data: null, error: "Non authentifié" };
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });

    if (!coach) {
      return { data: null, error: "Vous n'êtes pas coach" };
    }

    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Bookings des prochaines 48h
    const bookings = await prisma.booking.findMany({
      where: {
        coachId: coach.id,
        status: "CONFIRMED",
        scheduledAt: {
          gte: now,
          lte: in48h,
        },
      },
      include: {
        user: true,
        session: {
          include: {
            markedMoments: {
              orderBy: { timestamp: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Pour chaque booking, calculer le numéro de séance
    const upcomingBookings: UpcomingBooking[] = await Promise.all(
      bookings.map(async (booking) => {
        // Compter les séances précédentes avec ce client
        const previousSessions = await prisma.booking.count({
          where: {
            coachId: coach.id,
            userId: booking.userId,
            status: "COMPLETED",
            scheduledAt: { lt: booking.scheduledAt },
          },
        });

        // Vérifier s'il y a des messages non lus (conversation récente)
        // Pour l'instant, on simplifie : on vérifie juste si une conversation existe
        // et si le dernier message n'est pas du coach
        let hasUnreadMessages = false;
        try {
          const conversation = await prisma.conversation.findFirst({
            where: {
              coachId: coach.id,
              userId: booking.userId,
            },
          });
          // Si conversation existe et le lastMessagePreview n'est pas vide
          // On considère qu'il y a potentiellement des messages à voir
          if (conversation?.lastMessagePreview) {
            // Vérifier si le dernier message est du client
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
          id: booking.id,
          scheduledAt: booking.scheduledAt,
          duration: booking.duration,
          mode: booking.mode,
          price: booking.price,
          user: {
            id: booking.user.id,
            name: booking.user.name,
            email: booking.user.email,
            image: booking.user.image,
          },
          session: booking.session
            ? {
                id: booking.session.id,
                status: booking.session.status,
                markedMoments: booking.session.markedMoments.map((m) => ({
                  id: m.id,
                  timestamp: m.timestamp,
                  note: m.note,
                })),
              }
            : null,
          sessionNumber: previousSessions + 1,
          hasUnreadMessages,
          lastMomentNote: booking.session?.markedMoments[0]?.note ?? null,
        };
      })
    );

    // Stats du mois
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStats = await prisma.booking.aggregate({
      where: {
        coachId: coach.id,
        status: "COMPLETED",
        scheduledAt: { gte: startOfMonth },
      },
      _sum: { price: true },
      _count: true,
    });

    return {
      data: {
        coach: {
          id: coach.id,
          name: coach.user.name?.split(" ")[0] || "Coach",
          verified: coach.verified,
        },
        upcomingBookings,
        monthRevenue: monthStats._sum.price ?? 0,
        monthSessions: monthStats._count,
      },
      error: null,
    };
  } catch (error) {
    console.error("[GET_COACH_DASHBOARD_ERROR]", error);
    return { data: null, error: "Erreur lors du chargement du dashboard" };
  }
}

interface PreBriefData {
  client: {
    id: string;
    name: string | null;
    email: string;
  };
  lastSession: {
    id: string;
    date: Date;
    summary: string | null;
    markedMoments: {
      id: string;
      timestamp: number;
      note: string | null;
    }[];
  } | null;
  totalSessions: number;
  recentMessages: {
    id: string;
    content: string;
    createdAt: Date;
    senderName: string | null;
  }[];
}

/**
 * Récupère les données du pré-brief pour une séance
 */
export async function getPreBriefData(
  bookingId: string
): Promise<ActionResult<PreBriefData>> {
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

    // Récupérer le booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    });

    if (!booking || booking.coachId !== coach.id) {
      return { data: null, error: "Réservation non trouvée" };
    }

    // Dernière séance complétée avec ce client
    const lastCompletedBooking = await prisma.booking.findFirst({
      where: {
        coachId: coach.id,
        userId: booking.userId,
        status: "COMPLETED",
        scheduledAt: { lt: booking.scheduledAt },
      },
      include: {
        session: {
          include: {
            markedMoments: {
              orderBy: { timestamp: "asc" },
            },
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });

    // Nombre total de séances avec ce client
    const totalSessions = await prisma.booking.count({
      where: {
        coachId: coach.id,
        userId: booking.userId,
        status: "COMPLETED",
      },
    });

    // Messages récents - récupérer directement les messages
    let recentMessages: PreBriefData["recentMessages"] = [];
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          coachId: coach.id,
          userId: booking.userId,
        },
      });

      if (conversation) {
        const messages = await prisma.chatMessage.findMany({
          where: {
            conversationId: conversation.id,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        });

        // Récupérer les noms des expéditeurs
        const senderIds = [...new Set(messages.map((m) => m.senderId))];
        const senders = await prisma.user.findMany({
          where: { id: { in: senderIds } },
          select: { id: true, name: true },
        });
        const senderMap = new Map(senders.map((s) => [s.id, s.name]));

        recentMessages = messages.map((m) => ({
          id: m.id,
          content: m.content,
          createdAt: m.createdAt,
          senderName: senderMap.get(m.senderId) ?? null,
        }));
      }
    } catch {
      // Ignorer les erreurs de messagerie
    }

    return {
      data: {
        client: {
          id: booking.user.id,
          name: booking.user.name,
          email: booking.user.email,
        },
        lastSession: lastCompletedBooking?.session
          ? {
              id: lastCompletedBooking.session.id,
              date: lastCompletedBooking.scheduledAt,
              summary: lastCompletedBooking.session.summaryRaw,
              markedMoments: lastCompletedBooking.session.markedMoments.map(
                (m) => ({
                  id: m.id,
                  timestamp: m.timestamp,
                  note: m.note,
                })
              ),
            }
          : null,
        totalSessions,
        recentMessages,
      },
      error: null,
    };
  } catch (error) {
    console.error("[GET_PRE_BRIEF_ERROR]", error);
    return { data: null, error: "Erreur lors du chargement du pré-brief" };
  }
}
