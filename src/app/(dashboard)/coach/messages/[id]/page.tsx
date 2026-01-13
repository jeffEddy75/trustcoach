import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import {
  getConversationByIdAction,
  getMessagesAction,
} from "@/actions/messaging.actions";
import { ChatView } from "@/components/features/messaging/ChatView";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";

interface ConversationPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ConversationPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getConversationByIdAction(id);

  if (!result.data) {
    return { title: "Conversation | TrustCoach" };
  }

  const userName = result.data.user.name || "Coaché";
  return {
    title: `Conversation avec ${userName} | TrustCoach`,
  };
}

async function ConversationContent({ id }: { id: string }) {
  const currentUser = await getCurrentDbUser();

  const [conversationResult, messagesResult] = await Promise.all([
    getConversationByIdAction(id),
    getMessagesAction(id),
  ]);

  if (conversationResult.error || !conversationResult.data) {
    notFound();
  }

  const conversation = conversationResult.data;
  const messages = messagesResult.data || [];

  // Le currentUserId pour le coach est le userId du coach
  const currentUserId = currentUser?.id || "";

  return (
    <ChatView
      conversation={conversation}
      initialMessages={messages}
      currentUserId={currentUserId}
      userView={false}
    />
  );
}

export default async function CoachConversationPage({
  params,
}: ConversationPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ConversationContent id={id} />
    </Suspense>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center gap-3 pb-4 border-b">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex-1 py-4 space-y-4">
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="h-16 w-1/2 ml-auto" />
        <Skeleton className="h-16 w-2/3" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
