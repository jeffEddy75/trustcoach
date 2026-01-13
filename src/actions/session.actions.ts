"use server";

import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";
import type { Session, Consent, MarkedMoment, ConsentType } from "@prisma/client";

type SessionWithRelations = Session & {
  consents: Consent[];
  markedMoments: MarkedMoment[];
};

/**
 * Créer une session pour une réservation
 */
export async function createSessionAction(
  bookingId: string
): Promise<ActionResult<Session>> {
  try {
    const user = await requireDbUser();

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { coach: true, session: true },
    });

    if (!booking) {
      return { data: null, error: "Réservation non trouvée" };
    }

    // Vérifier les droits
    const isOwner = booking.userId === user.id;
    const isCoach = booking.coach.userId === user.id;

    if (!isOwner && !isCoach) {
      return { data: null, error: "Accès non autorisé" };
    }

    // Vérifier qu'il n'y a pas déjà une session
    if (booking.session) {
      return { data: booking.session, error: null };
    }

    // Créer la session
    const session = await prisma.session.create({
      data: {
        bookingId,
        status: "IDLE",
      },
    });

    return { data: session, error: null };
  } catch (error) {
    console.error("[CREATE_SESSION_ERROR]", error);
    return { data: null, error: "Erreur lors de la création de la session" };
  }
}

/**
 * Enregistrer les consentements RGPD
 */
export async function saveConsentsAction(
  sessionId: string,
  consents: {
    audioRecording: boolean;
    dataProcessing: boolean;
    summarySharing: boolean;
  }
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const user = await requireDbUser();

    // Récupérer la session et la réservation
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { booking: { include: { coach: true } } },
    });

    if (!session) {
      return { data: null, error: "Session non trouvée" };
    }

    const booking = session.booking;
    const isOwner = booking.userId === user.id;

    if (!isOwner) {
      return { data: null, error: "Accès non autorisé" };
    }

    // Créer les consentements
    const consentTypes: ConsentType[] = [];

    if (consents.audioRecording) {
      consentTypes.push("AUDIO_RECORDING");
    }
    if (consents.dataProcessing) {
      consentTypes.push("DATA_PROCESSING");
    }
    if (consents.summarySharing) {
      consentTypes.push("SUMMARY_SHARING");
    }

    // Supprimer les anciens consentements pour cette session/utilisateur
    await prisma.consent.deleteMany({
      where: {
        sessionId,
        userId: user.id,
      },
    });

    // Créer les nouveaux consentements
    if (consentTypes.length > 0) {
      for (const type of consentTypes) {
        await prisma.consent.create({
          data: {
            sessionId,
            userId: user.id,
            coachId: booking.coachId,
            type,
            accepted: true,
          },
        });
      }
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("[SAVE_CONSENTS_ERROR]", error);
    return { data: null, error: "Erreur lors de l'enregistrement des consentements" };
  }
}

/**
 * Mettre à jour le statut de la session
 */
export async function updateSessionStatusAction(
  sessionId: string,
  status: "RECORDING" | "UPLOADING" | "TRANSCRIBING" | "SUMMARIZING" | "COMPLETED" | "FAILED",
  errorMessage?: string
): Promise<ActionResult<Session>> {
  try {
    await requireDbUser();

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        status,
        statusMessage: errorMessage,
      },
    });

    return { data: session, error: null };
  } catch (error) {
    console.error("[UPDATE_SESSION_STATUS_ERROR]", error);
    return { data: null, error: "Erreur lors de la mise à jour du statut" };
  }
}

/**
 * Sauvegarder l'audio uploadé
 */
export async function saveAudioAction(
  sessionId: string,
  audioData: {
    url: string;
    size: number;
    duration?: number;
    format: string;
  }
): Promise<ActionResult<Session>> {
  try {
    await requireDbUser();

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        audioUrl: audioData.url,
        audioSize: audioData.size,
        audioDuration: audioData.duration,
        audioFormat: audioData.format,
        status: "TRANSCRIBING",
      },
    });

    return { data: session, error: null };
  } catch (error) {
    console.error("[SAVE_AUDIO_ERROR]", error);
    return { data: null, error: "Erreur lors de la sauvegarde de l'audio" };
  }
}

/**
 * Sauvegarder la transcription
 */
export async function saveTranscriptAction(
  sessionId: string,
  transcript: string
): Promise<ActionResult<Session>> {
  try {
    await requireDbUser();

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        transcript,
        transcribedAt: new Date(),
        status: "SUMMARIZING",
      },
    });

    return { data: session, error: null };
  } catch (error) {
    console.error("[SAVE_TRANSCRIPT_ERROR]", error);
    return { data: null, error: "Erreur lors de la sauvegarde de la transcription" };
  }
}

/**
 * Sauvegarder le résumé IA
 */
export async function saveSummaryAction(
  sessionId: string,
  summary: string
): Promise<ActionResult<Session>> {
  try {
    await requireDbUser();

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        summaryRaw: summary,
        summarizedAt: new Date(),
        status: "COMPLETED",
      },
    });

    // Mettre à jour le statut de la réservation
    await prisma.booking.update({
      where: { id: session.bookingId },
      data: { status: "COMPLETED" },
    });

    return { data: session, error: null };
  } catch (error) {
    console.error("[SAVE_SUMMARY_ERROR]", error);
    return { data: null, error: "Erreur lors de la sauvegarde du résumé" };
  }
}

/**
 * Sauvegarder les moments marqués
 */
export async function saveMarkedMomentsAction(
  sessionId: string,
  moments: { timestamp: number; note?: string }[]
): Promise<ActionResult<{ success: boolean }>> {
  try {
    await requireDbUser();

    // Supprimer les anciens moments
    await prisma.markedMoment.deleteMany({
      where: { sessionId },
    });

    // Créer les nouveaux
    if (moments.length > 0) {
      await prisma.markedMoment.createMany({
        data: moments.map((m) => ({
          sessionId,
          timestamp: m.timestamp,
          note: m.note,
          type: "IMPORTANT",
        })),
      });
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("[SAVE_MARKED_MOMENTS_ERROR]", error);
    return { data: null, error: "Erreur lors de la sauvegarde des moments" };
  }
}

/**
 * Récupérer une session avec toutes ses données
 */
export async function getSessionAction(
  sessionId: string
): Promise<ActionResult<SessionWithRelations>> {
  try {
    const user = await requireDbUser();

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        booking: { include: { coach: { include: { user: true } }, user: true } },
        consents: true,
        markedMoments: { orderBy: { timestamp: "asc" } },
      },
    });

    if (!session) {
      return { data: null, error: "Session non trouvée" };
    }

    // Vérifier les droits
    const booking = session.booking;
    const isOwner = booking.userId === user.id;
    const isCoach = booking.coach.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isCoach && !isAdmin) {
      return { data: null, error: "Accès non autorisé" };
    }

    return { data: session, error: null };
  } catch (error) {
    console.error("[GET_SESSION_ERROR]", error);
    return { data: null, error: "Erreur lors de la récupération de la session" };
  }
}

/**
 * Réinitialiser une session pour tester l'enregistrement (mode test uniquement)
 */
export async function resetSessionAction(
  sessionId: string
): Promise<ActionResult<Session>> {
  try {
    const user = await requireDbUser();

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { booking: { include: { coach: true } } },
    });

    if (!session) {
      return { data: null, error: "Session non trouvée" };
    }

    // Vérifier les droits (propriétaire ou coach)
    const isOwner = session.booking.userId === user.id;
    const isCoach = session.booking.coach.userId === user.id;

    if (!isOwner && !isCoach) {
      return { data: null, error: "Accès non autorisé" };
    }

    // Réinitialiser la session
    const resetSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: "IDLE",
        statusMessage: null,
        audioUrl: null,
        audioSize: null,
        audioDuration: null,
        audioFormat: null,
        transcript: null,
        transcribedAt: null,
        summaryRaw: null,
        summaryFinal: null,
        summarizedAt: null,
      },
    });

    // Supprimer les consentements et moments marqués
    await prisma.consent.deleteMany({
      where: { sessionId },
    });

    await prisma.markedMoment.deleteMany({
      where: { sessionId },
    });

    // Remettre le booking en CONFIRMED (pas COMPLETED)
    await prisma.booking.update({
      where: { id: session.bookingId },
      data: { status: "CONFIRMED" },
    });

    console.log(`[TEST_MODE] Session ${sessionId} reset by user ${user.id}`);

    return { data: resetSession, error: null };
  } catch (error) {
    console.error("[RESET_SESSION_ERROR]", error);
    return { data: null, error: "Erreur lors de la réinitialisation" };
  }
}

/**
 * Le coach valide et édite le résumé
 */
export async function validateSummaryAction(
  sessionId: string,
  finalSummary: string
): Promise<ActionResult<Session>> {
  try {
    const user = await requireDbUser();

    // Vérifier que l'utilisateur est le coach
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { booking: { include: { coach: true } } },
    });

    if (!session) {
      return { data: null, error: "Session non trouvée" };
    }

    if (session.booking.coach.userId !== user.id) {
      return { data: null, error: "Seul le coach peut valider le résumé" };
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        summaryFinal: finalSummary,
      },
    });

    return { data: updatedSession, error: null };
  } catch (error) {
    console.error("[VALIDATE_SUMMARY_ERROR]", error);
    return { data: null, error: "Erreur lors de la validation du résumé" };
  }
}
