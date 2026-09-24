"use client";

import { ChatThread } from "@/components/chat/ChatThread";
import { PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { currentPersonal } from "@/lib/mocks";
import { useProfile } from "@/lib/profile";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const CONV_MAP: Record<string, string> = {
  "s-001": "c-001",
  "s-002": "c-002",
  "s-004": "c-003",
};

export default function ChatThreadPage() {
  const { alunoId } = useParams<{ alunoId: string }>();
  const convId = CONV_MAP[alunoId] ?? "c-001";
  const profile = useProfile();
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
      <ChatThread conversationId={convId} myId={profile?.id ?? currentPersonal.id} />
    </div>
  );
}
