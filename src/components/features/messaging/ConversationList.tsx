"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { ConversationWithDetails } from "@/actions/messaging.actions";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  userView?: boolean; // true = vue user, false = vue coach
}

export function ConversationList({
  conversations,
  userView = true,
}: ConversationListProps) {
  const basePath = userView ? "/user/messages" : "/coach/messages";

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => {
        // Déterminer l'autre participant
        const otherParticipant = userView
          ? {
              name: conversation.coach.user.name,
              image: conversation.coach.user.image,
              subtitle: conversation.coach.headline,
            }
          : {
              name: conversation.user.name,
              image: conversation.user.image,
              subtitle: null,
            };

        const initials = otherParticipant.name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase() || "?";

        return (
          <Link key={conversation.id} href={`${basePath}/${conversation.id}`}>
            <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={otherParticipant.image || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">
                      {otherParticipant.name || "Utilisateur"}
                    </h3>
                    {conversation.status === "PROSPECT" && (
                      <Badge variant="secondary" className="text-xs">
                        Nouveau
                      </Badge>
                    )}
                  </div>

                  {otherParticipant.subtitle && (
                    <p className="text-sm text-muted-foreground truncate">
                      {otherParticipant.subtitle}
                    </p>
                  )}

                  {conversation.lastMessagePreview && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conversation.lastMessagePreview}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  {conversation.lastMessageAt && (
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {conversation._count.messages} message
                    {conversation._count.messages > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
