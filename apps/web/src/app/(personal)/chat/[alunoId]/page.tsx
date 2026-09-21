"use client";

import { Button, Input, PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import type { Message } from "@/lib/mocks";
import { cn, formatDate } from "@/lib/utils";
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
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [peerName, setPeerName] = useState("Aluno");

  useEffect(() => {
    api.getMessages(convId).then((r) => setMessages(r.items));
    api.getStudent(alunoId).then((s) => setPeerName(s.name)).catch(() => {});
  }, [convId, alunoId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const m = await api.sendMessage(convId, body.trim());
      setMessages((prev) => [...(prev ?? []), m]);
      setBody("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col md:h-auto md:min-h-[28rem]">
      <PageHeader
        title={peerName}
        action={
          <Link href="/chat" className="text-sm text-brand">
            Voltar
          </Link>
        }
      />
      <div className="flex-1 space-y-3 overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-surface p-4">
        {!messages ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          messages.map((m) => {
            const mine = m.senderId.startsWith("p-");
            return (
              <div
                key={m.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-[var(--radius-md)] px-3 py-2 text-sm",
                    mine
                      ? "bg-brand text-text-inverse"
                      : "bg-gray-100 text-text",
                  )}
                >
                  <p>{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      mine ? "text-white/70" : "text-text-muted",
                    )}
                  >
                    {formatDate(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <Input
          placeholder="Mensagem"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" loading={sending}>
          Enviar
        </Button>
      </form>
    </div>
  );
}
