"use client";

import { ChatThread } from "@/components/chat/ChatThread";
import { PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChatThreadPage() {
  const { alunoId } = useParams<{ alunoId: string }>();
  const [peerName, setPeerName] = useState("Aluno");

  useEffect(() => {
    api.getStudent(alunoId).then((s) => setPeerName(s.name)).catch(() => {});
  }, [alunoId]);

  return (
    <div className="flex h-[calc(100dvh-10rem)] flex-col md:h-[calc(100dvh-7rem)]">
      <PageHeader
        title={peerName}
        action={
          <Link href="/chat" className="text-sm text-brand">
            Voltar
          </Link>
        }
      />
      <ChatThread conversationId={alunoId} myId="personal" />
    </div>
  );
}
