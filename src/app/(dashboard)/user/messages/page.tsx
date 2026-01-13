import { Suspense } from "react";
import { getConversationsAction } from "@/actions/messaging.actions";
import { ConversationList } from "@/components/features/messaging/ConversationList";
import { EmptyState } from "@/components/features/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes messages | TrustCoach",
  description: "Vos conversations avec les coachs",
};

async function MessagesContent() {
  const result = await getConversationsAction();

  if (result.error) {
    return (
      <EmptyState
        title="Erreur"
        description={result.error}
      />
    );
  }

  const conversations = result.data || [];

  if (conversations.length === 0) {
    return (
      <EmptyState
        title="Aucune conversation"
        description="Vous n'avez pas encore de conversation. Contactez un coach pour commencer."
        action={{
          label: "Trouver un coach",
          href: "/coaches",
        }}
      />
    );
  }

  return <ConversationList conversations={conversations} userView />;
}

export default function UserMessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold">Mes messages</h1>
          <p className="text-muted-foreground">
            Vos conversations avec les coachs
          </p>
        </div>
      </div>

      <Suspense fallback={<ConversationListSkeleton />}>
        <MessagesContent />
      </Suspense>
    </div>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
