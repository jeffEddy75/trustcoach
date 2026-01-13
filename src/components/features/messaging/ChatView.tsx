"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Send, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  sendMessageAction,
  getMessagesAction,
  type ConversationWithDetails,
  type ChatMessageWithSender,
} from "@/actions/messaging.actions";
import { cn } from "@/lib/utils";

interface ChatViewProps {
  conversation: ConversationWithDetails;
  initialMessages: ChatMessageWithSender[];
  currentUserId: string;
  userView?: boolean;
}

const MAX_PROSPECT_MESSAGES = 3;
const POLLING_INTERVAL = 10000; // 10 secondes

export function ChatView({
  conversation,
  initialMessages,
  currentUserId,
  userView = true,
}: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessageWithSender[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Déterminer l'autre participant
  const otherParticipant = userView
    ? {
        name: conversation.coach.user.name,
        image: conversation.coach.user.image,
        subtitle: conversation.coach.headline,
        profileUrl: `/coaches/${conversation.coachId}`,
      }
    : {
        name: conversation.user.name,
        image: conversation.user.image,
        subtitle: null,
        profileUrl: null,
      };

  const initials =
    otherParticipant.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  // Vérifier la limite pour les prospects
  const isProspect = conversation.status === "PROSPECT";
  const userMessageCount = messages.filter(
    (m) => m.senderRole === "USER"
  ).length;
  const canSendMessage =
    !isProspect || !userView || userMessageCount < MAX_PROSPECT_MESSAGES;
  const remainingMessages = MAX_PROSPECT_MESSAGES - userMessageCount;

  // Scroll vers le bas
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Polling pour les nouveaux messages
  useEffect(() => {
    const fetchMessages = async () => {
      const result = await getMessagesAction(conversation.id);
      if (result.data) {
        setMessages(result.data);
      }
    };

    const interval = setInterval(fetchMessages, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [conversation.id]);

  // Envoyer un message
  const handleSend = async () => {
    if (!newMessage.trim() || isSending || !canSendMessage) return;

    setIsSending(true);
    setError(null);

    const result = await sendMessageAction(conversation.id, newMessage.trim());

    if (result.error) {
      setError(result.error);
      setIsSending(false);
      return;
    }

    if (result.data) {
      setMessages((prev) => [...prev, result.data!]);
      setNewMessage("");
      textareaRef.current?.focus();
    }

    setIsSending(false);
  };

  // Envoyer avec Enter (Shift+Enter pour nouvelle ligne)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const backUrl = userView ? "/user/messages" : "/coach/messages";

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href={backUrl}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        <Avatar className="h-10 w-10">
          <AvatarImage src={otherParticipant.image || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {otherParticipant.profileUrl ? (
              <Link
                href={otherParticipant.profileUrl}
                className="font-medium hover:underline truncate"
              >
                {otherParticipant.name || "Utilisateur"}
              </Link>
            ) : (
              <span className="font-medium truncate">
                {otherParticipant.name || "Utilisateur"}
              </span>
            )}
            {isProspect && (
              <Badge variant="secondary" className="text-xs">
                Nouveau contact
              </Badge>
            )}
          </div>
          {otherParticipant.subtitle && (
            <p className="text-sm text-muted-foreground truncate">
              {otherParticipant.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Aucun message pour le moment.</p>
            <p className="text-sm mt-1">Envoyez le premier message !</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            const messageDate = new Date(message.createdAt);

            return (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  isOwn ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2",
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {format(messageDate, "HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Alerte limite prospect */}
      {isProspect && userView && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {canSendMessage ? (
              <>
                Vous avez {remainingMessages} message
                {remainingMessages > 1 ? "s" : ""} restant
                {remainingMessages > 1 ? "s" : ""} avant de réserver une séance.
              </>
            ) : (
              <>
                Limite atteinte.{" "}
                <Link
                  href={`/booking/${conversation.coachId}`}
                  className="font-medium underline"
                >
                  Réservez une séance
                </Link>{" "}
                pour continuer la conversation.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Erreur */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-4 border-t">
        <Textarea
          ref={textareaRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            canSendMessage
              ? "Écrivez votre message..."
              : "Réservez une séance pour continuer"
          }
          disabled={!canSendMessage || isSending}
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending || !canSendMessage}
          size="icon"
          className="shrink-0"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
