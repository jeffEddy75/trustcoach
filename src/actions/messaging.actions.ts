"use server";

import { prisma } from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";
import type { Conversation, ChatMessage, ConversationStatus } from "@prisma/client";

// ============================================
// CONSTANTS
// ============================================

const MAX_PROSPECT_MESSAGES = 3; // Limite avant 1ère réservation payée
const MESSAGE_PREVIEW_LENGTH = 50;

// ============================================
// TYPES
// ============================================

export type ConversationWithDetails = Conversation & {
  user: { id: string; name: string | null; image: string | null };
  coach: {
    id: string;
    user: { id: string; name: string | null; image: string | null };
    headline: string | null;
  };
  _count: { messages: number };
};

export type ChatMessageWithSender = ChatMessage & {
  senderName?: string;
  senderImage?: string | null;
};

// ============================================
// GET CONVERSATIONS
// ============================================

export async function getConversationsAction(): Promise<
  ActionResult<ConversationWithDetails[]>
> {
  try {
    const user = await requireDbUser();
    const userId = user.id;

    // Vérifier si l'utilisateur est coach
    const coach = await prisma.coach.findUnique({
      where: { userId },
      select: { id: true },
    });

    // Récupérer les conversations où l'utilisateur est soit user, soit coach
    const conversations = await prisma.conversation.findMany({
      where: coach
        ? { OR: [{ userId }, { coachId: coach.id }] }
        : { userId },
      include: {
        user: { select: { id: true, name: true, image: true } },
        coach: {
          select: {
            id: true,
            headline: true,
            user: { select: { id: true, name: true, image: true } },
          },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    return { data: conversations, error: null };
  } catch (error) {
    console.error("[GET_CONVERSATIONS_ERROR]", error);
    return { data: null, error: "Erreur lors de la récupération des conversations" };
  }
}

// ============================================
// GET OR CREATE CONVERSATION
// ============================================

export async function getOrCreateConversationAction(
  coachId: string
): Promise<ActionResult<Conversation>> {
  try {
    const user = await requireDbUser();
    const userId = user.id;

    // Vérifier que le coach existe
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      select: { id: true, userId: true },
    });

    if (!coach) {
      return { data: null, error: "Coach non trouvé" };
    }

    // Un coach ne peut pas s'envoyer de message à lui-même
    if (coach.userId === userId) {
      return { data: null, error: "Vous ne pouvez pas vous envoyer de message" };
    }

    // Chercher une conversation existante
    let conversation = await prisma.conversation.findUnique({
      where: { userId_coachId: { userId, coachId } },
    });

    // Si pas de conversation, en créer une
    if (!conversation) {
      // Vérifier si l'utilisateur a déjà une réservation payée avec ce coach
      const hasBooking = await prisma.booking.findFirst({
        where: {
          userId,
          coachId,
          status: { in: ["CONFIRMED", "COMPLETED", "IN_PROGRESS"] },
        },
      });

      const status: ConversationStatus = hasBooking ? "ACTIVE" : "PROSPECT";

      conversation = await prisma.conversation.create({
        data: {
          userId,
          coachId,
          status,
        },
      });
    }

    return { data: conversation, error: null };
  } catch (error) {
    console.error("[GET_OR_CREATE_CONVERSATION_ERROR]", {
      error,
      coachId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return { data: null, error: "Erreur lors de la création de la conversation" };
  }
}

// ============================================
// GET MESSAGES
// ============================================

export async function getMessagesAction(
  conversationId: string
): Promise<ActionResult<ChatMessageWithSender[]>> {
  try {
    const user = await requireDbUser();
    const userId = user.id;

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        coach: { select: { userId: true } },
      },
    });

    if (!conversation) {
      return { data: null, error: "Conversation non trouvée" };
    }

    const isParticipant =
      conversation.userId === userId || conversation.coach.userId === userId;

    if (!isParticipant) {
      return { data: null, error: "Accès non autorisé" };
    }

    // Récupérer les messages
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return { data: messages, error: null };
  } catch (error) {
    console.error("[GET_MESSAGES_ERROR]", error);
    return { data: null, error: "Erreur lors de la récupération des messages" };
  }
}

// ============================================
// SEND MESSAGE
// ============================================

export async function sendMessageAction(
  conversationId: string,
  content: string
): Promise<ActionResult<ChatMessage>> {
  try {
    const user = await requireDbUser();
    const userId = user.id;

    // Valider le contenu
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return { data: null, error: "Le message ne peut pas être vide" };
    }

    if (trimmedContent.length > 5000) {
      return { data: null, error: "Le message est trop long (max 5000 caractères)" };
    }

    // Récupérer la conversation avec le coach
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        coach: { select: { id: true, userId: true } },
      },
    });

    if (!conversation) {
      return { data: null, error: "Conversation non trouvée" };
    }

    // Déterminer le rôle de l'expéditeur
    const isCoach = conversation.coach.userId === userId;
    const isUser = conversation.userId === userId;

    if (!isCoach && !isUser) {
      return { data: null, error: "Accès non autorisé" };
    }

    // Vérifier la limite de messages pour les prospects (côté user uniquement)
    if (
      conversation.status === "PROSPECT" &&
      isUser &&
      conversation.prospectMessageCount >= MAX_PROSPECT_MESSAGES
    ) {
      return {
        data: null,
        error: `Limite de ${MAX_PROSPECT_MESSAGES} messages atteinte. Réservez une séance pour continuer la conversation.`,
      };
    }

    // Créer le message
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: userId,
        senderRole: isCoach ? "COACH" : "USER",
        content: trimmedContent,
      },
    });

    // Mettre à jour la conversation
    const preview =
      trimmedContent.length > MESSAGE_PREVIEW_LENGTH
        ? trimmedContent.substring(0, MESSAGE_PREVIEW_LENGTH) + "..."
        : trimmedContent;

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: preview,
        // Incrémenter le compteur si c'est un message d'un prospect (user)
        ...(conversation.status === "PROSPECT" && isUser
          ? { prospectMessageCount: { increment: 1 } }
          : {}),
      },
    });

    revalidatePath("/user/messages");
    revalidatePath("/coach/messages");

    return { data: message, error: null };
  } catch (error) {
    console.error("[SEND_MESSAGE_ERROR]", error);
    return { data: null, error: "Erreur lors de l'envoi du message" };
  }
}

// ============================================
// UPGRADE CONVERSATION STATUS (appelé par webhook Stripe)
// ============================================

export async function upgradeConversationToActiveAction(
  userId: string,
  coachId: string
): Promise<ActionResult<Conversation>> {
  try {
    // Cette action est appelée côté serveur (webhook), pas de session check

    const conversation = await prisma.conversation.findUnique({
      where: { userId_coachId: { userId, coachId } },
    });

    if (!conversation) {
      // Pas de conversation existante, rien à faire
      return { data: null, error: null };
    }

    if (conversation.status !== "PROSPECT") {
      // Déjà active ou archivée
      return { data: conversation, error: null };
    }

    // Passer en ACTIVE
    const updated = await prisma.conversation.update({
      where: { id: conversation.id },
      data: { status: "ACTIVE" },
    });

    return { data: updated, error: null };
  } catch (error) {
    console.error("[UPGRADE_CONVERSATION_ERROR]", error);
    return { data: null, error: "Erreur lors de la mise à jour de la conversation" };
  }
}

// ============================================
// GET CONVERSATION BY ID
// ============================================

export async function getConversationByIdAction(
  conversationId: string
): Promise<ActionResult<ConversationWithDetails>> {
  try {
    const user = await requireDbUser();
    const userId = user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: { select: { id: true, name: true, image: true } },
        coach: {
          select: {
            id: true,
            headline: true,
            user: { select: { id: true, name: true, image: true } },
          },
        },
        _count: { select: { messages: true } },
      },
    });

    if (!conversation) {
      return { data: null, error: "Conversation non trouvée" };
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const isParticipant =
      conversation.userId === userId || conversation.coach.user.id === userId;

    if (!isParticipant) {
      return { data: null, error: "Accès non autorisé" };
    }

    return { data: conversation, error: null };
  } catch (error) {
    console.error("[GET_CONVERSATION_BY_ID_ERROR]", error);
    return { data: null, error: "Erreur lors de la récupération de la conversation" };
  }
}
