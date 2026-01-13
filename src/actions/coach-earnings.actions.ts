"use server";

import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

export interface MonthlyEarning {
  month: Date;
  total: number;
  sessions: number;
}

export interface Transaction {
  id: string;
  date: Date;
  clientName: string | null;
  clientEmail: string;
  sessionNumber: number;
  amount: number;
  status: "COMPLETED" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
  hasInvoice: boolean;
  invoiceStatus: "DRAFT" | "ISSUED" | "SENT" | null;
}

interface EarningsData {
  thisMonth: {
    total: number;
    sessions: number;
  };
  pending: {
    total: number;
    sessions: number;
  };
  monthlyHistory: MonthlyEarning[];
  recentTransactions: Transaction[];
}

/**
 * Récupère les données financières du coach
 */
export async function getCoachEarnings(): Promise<ActionResult<EarningsData>> {
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
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Revenus ce mois (séances complétées)
    const thisMonthCompleted = await prisma.booking.aggregate({
      where: {
        coachId: coach.id,
        status: "COMPLETED",
        scheduledAt: { gte: startOfMonth },
      },
      _sum: { price: true },
      _count: true,
    });

    // Revenus en attente (séances confirmées, pas encore réalisées)
    const pending = await prisma.booking.aggregate({
      where: {
        coachId: coach.id,
        status: "CONFIRMED",
        scheduledAt: { gte: now },
      },
      _sum: { price: true },
      _count: true,
    });

    // Historique par mois (6 derniers mois)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyBookings = await prisma.booking.findMany({
      where: {
        coachId: coach.id,
        status: "COMPLETED",
        scheduledAt: { gte: sixMonthsAgo },
      },
      select: {
        scheduledAt: true,
        price: true,
      },
    });

    // Grouper par mois
    const monthlyMap = new Map<string, { total: number; sessions: number }>();

    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      monthlyMap.set(key, { total: 0, sessions: 0 });
    }

    for (const booking of monthlyBookings) {
      const date = new Date(booking.scheduledAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const existing = monthlyMap.get(key);
      if (existing) {
        existing.total += booking.price;
        existing.sessions++;
      }
    }

    const monthlyHistory: MonthlyEarning[] = Array.from(monthlyMap.entries())
      .map(([key, data]) => {
        const parts = key.split("-").map(Number);
        const year = parts[0] ?? new Date().getFullYear();
        const month = parts[1] ?? 0;
        return {
          month: new Date(year, month, 1),
          total: data.total,
          sessions: data.sessions,
        };
      })
      .sort((a, b) => b.month.getTime() - a.month.getTime());

    // Dernières transactions (10)
    const recentBookings = await prisma.booking.findMany({
      where: {
        coachId: coach.id,
        status: { in: ["COMPLETED", "CONFIRMED", "CANCELLED", "REFUNDED"] },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        invoice: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
      take: 10,
    });

    // Calculer le numéro de séance pour chaque transaction
    const recentTransactions: Transaction[] = await Promise.all(
      recentBookings.map(async (booking) => {
        const sessionNumber = await prisma.booking.count({
          where: {
            coachId: coach.id,
            userId: booking.userId,
            status: "COMPLETED",
            scheduledAt: { lte: booking.scheduledAt },
          },
        });

        return {
          id: booking.id,
          date: booking.scheduledAt,
          clientName: booking.user.name,
          clientEmail: booking.user.email,
          sessionNumber: sessionNumber || 1,
          amount: booking.price,
          status: booking.status as Transaction["status"],
          hasInvoice: !!booking.invoice,
          invoiceStatus: booking.invoice?.status ?? null,
        };
      })
    );

    return {
      data: {
        thisMonth: {
          total: thisMonthCompleted._sum.price ?? 0,
          sessions: thisMonthCompleted._count,
        },
        pending: {
          total: pending._sum.price ?? 0,
          sessions: pending._count,
        },
        monthlyHistory,
        recentTransactions,
      },
      error: null,
    };
  } catch (error) {
    console.error("[GET_COACH_EARNINGS_ERROR]", error);
    return { data: null, error: "Erreur lors du chargement des revenus" };
  }
}

/**
 * Exporte les transactions au format CSV
 */
export async function exportEarningsCSV(): Promise<ActionResult<string>> {
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

    // Récupérer toutes les transactions de l'année
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const bookings = await prisma.booking.findMany({
      where: {
        coachId: coach.id,
        status: { in: ["COMPLETED", "REFUNDED"] },
        scheduledAt: { gte: startOfYear },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });

    // Générer le CSV
    const headers = ["Date", "Client", "Email", "Montant", "Statut"];
    const rows = bookings.map((b) => [
      new Date(b.scheduledAt).toLocaleDateString("fr-FR"),
      b.user.name || "N/A",
      b.user.email,
      (b.price / 100).toFixed(2) + " €",
      b.status === "COMPLETED" ? "Payé" : "Remboursé",
    ]);

    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    return { data: csv, error: null };
  } catch (error) {
    console.error("[EXPORT_EARNINGS_CSV_ERROR]", error);
    return { data: null, error: "Erreur lors de l'export" };
  }
}
