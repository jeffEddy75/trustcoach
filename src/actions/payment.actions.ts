"use server";

import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, createRefund, STRIPE_ENABLED } from "@/services/stripe";
import type { ActionResult } from "@/types";

/**
 * Créer une session de paiement Stripe pour une réservation
 */
export async function createPaymentSessionAction(
  bookingId: string
): Promise<ActionResult<{ checkoutUrl: string }>> {
  try {
    const user = await requireDbUser();

    // Récupérer la réservation
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        coach: { include: { user: true } },
        user: true,
      },
    });

    if (!booking) {
      return { data: null, error: "Réservation non trouvée" };
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (booking.userId !== user.id) {
      return { data: null, error: "Accès non autorisé" };
    }

    // Vérifier que la réservation est en attente de paiement
    if (booking.status !== "PENDING") {
      return { data: null, error: "Cette réservation ne peut pas être payée" };
    }

    // Vérifier que le prix est défini
    if (!booking.price || booking.price <= 0) {
      return { data: null, error: "Prix invalide" };
    }

    // Formater la date pour l'affichage
    const sessionDate = new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(booking.scheduledAt);

    // Créer la session Stripe Checkout
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const stripeSession = await createCheckoutSession({
      bookingId: booking.id,
      priceInCents: booking.price,
      currency: booking.currency,
      coachName: booking.coach.user.name || "Coach",
      sessionDate,
      duration: booking.duration,
      customerEmail: booking.user.email,
      successUrl: `${appUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancelUrl: `${appUrl}/booking/${booking.coachId}?cancelled=true`,
    });

    // Mode test : Stripe désactivé
    if (!stripeSession) {
      return {
        data: null,
        error: "STRIPE_DISABLED",
      };
    }

    // Sauvegarder l'ID de session Stripe sur la réservation
    await prisma.booking.update({
      where: { id: bookingId },
      data: { stripeSessionId: stripeSession.id },
    });

    if (!stripeSession.url) {
      return { data: null, error: "Erreur lors de la création de la session de paiement" };
    }

    return { data: { checkoutUrl: stripeSession.url }, error: null };
  } catch (error) {
    console.error("[CREATE_PAYMENT_SESSION_ERROR]", error);
    return { data: null, error: "Erreur lors de la création du paiement" };
  }
}

/**
 * Confirmer une réservation sans paiement (mode test)
 * Disponible uniquement si Stripe n'est pas configuré
 */
export async function confirmBookingWithoutPaymentAction(
  bookingId: string
): Promise<ActionResult<{ success: boolean; redirectUrl: string }>> {
  try {
    // Vérifier que Stripe est désactivé
    if (STRIPE_ENABLED) {
      return { data: null, error: "Le paiement est requis" };
    }

    const user = await requireDbUser();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        coach: { include: { user: true } },
      },
    });

    if (!booking) {
      return { data: null, error: "Réservation non trouvée" };
    }

    if (booking.userId !== user.id) {
      return { data: null, error: "Accès non autorisé" };
    }

    if (booking.status !== "PENDING") {
      return { data: null, error: "Cette réservation ne peut pas être confirmée" };
    }

    // Confirmer la réservation sans paiement
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        paidAt: new Date(),
      },
    });

    console.log(`[TEST_MODE] Booking ${bookingId} confirmed without payment`);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return {
      data: {
        success: true,
        redirectUrl: `${appUrl}/booking/success?booking_id=${bookingId}`,
      },
      error: null,
    };
  } catch (error) {
    console.error("[CONFIRM_WITHOUT_PAYMENT_ERROR]", error);
    return { data: null, error: "Erreur lors de la confirmation" };
  }
}

/**
 * Vérifier si le mode test (sans Stripe) est actif
 */
export async function isTestModeAction(): Promise<ActionResult<{ testMode: boolean }>> {
  return { data: { testMode: !STRIPE_ENABLED }, error: null };
}

/**
 * Vérifier le statut d'un paiement
 */
export async function checkPaymentStatusAction(
  bookingId: string
): Promise<ActionResult<{ status: string; paidAt: Date | null }>> {
  try {
    const user = await requireDbUser();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { data: null, error: "Réservation non trouvée" };
    }

    // Vérifier les droits d'accès
    const coach = await prisma.coach.findFirst({
      where: { userId: user.id },
    });

    const isOwner = booking.userId === user.id;
    const isCoach = coach?.id === booking.coachId;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isCoach && !isAdmin) {
      return { data: null, error: "Accès non autorisé" };
    }

    return {
      data: {
        status: booking.status,
        paidAt: booking.paidAt,
      },
      error: null,
    };
  } catch (error) {
    console.error("[CHECK_PAYMENT_STATUS_ERROR]", error);
    return { data: null, error: "Erreur lors de la vérification du paiement" };
  }
}

/**
 * Demander un remboursement (par le coach ou l'admin)
 */
export async function requestRefundAction(
  bookingId: string,
  reason?: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const user = await requireDbUser();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { coach: true },
    });

    if (!booking) {
      return { data: null, error: "Réservation non trouvée" };
    }

    // Seul le coach ou l'admin peut initier un remboursement
    const isCoach = booking.coach.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isCoach && !isAdmin) {
      return { data: null, error: "Seul le coach ou l'admin peut effectuer un remboursement" };
    }

    // Vérifier que la réservation a été payée
    if (!booking.stripePaymentIntentId) {
      return { data: null, error: "Aucun paiement trouvé pour cette réservation" };
    }

    // Vérifier que la réservation n'est pas déjà remboursée
    if (booking.status === "REFUNDED" || booking.status === "PARTIALLY_REFUNDED") {
      return { data: null, error: "Cette réservation a déjà été remboursée" };
    }

    // Effectuer le remboursement via Stripe
    await createRefund({
      paymentIntentId: booking.stripePaymentIntentId,
      reason: "requested_by_customer",
    });

    // Mettre à jour le statut (le webhook mettra à jour automatiquement aussi)
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "REFUNDED",
        refundedAt: new Date(),
        cancellationReason: reason,
      },
    });

    console.log(`[REFUND] Booking ${bookingId} refunded by ${user.id}`);

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("[REQUEST_REFUND_ERROR]", error);
    return { data: null, error: "Erreur lors du remboursement" };
  }
}
