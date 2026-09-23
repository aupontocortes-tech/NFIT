"use client";

import { ChatThread } from "@/components/chat/ChatThread";
import { PageHeader } from "@/components/ui";
import { currentAluno } from "@/lib/mocks";

export default function AlunoChatPage() {
  return (
    <div className="flex h-[calc(100dvh-10rem)] flex-col">
      <PageHeader title="Chat" description="Com seu personal" />
      <ChatThread conversationId="c-001" myId={currentAluno.id} />
    </div>
  );
}
