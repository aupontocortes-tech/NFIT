"use client";

import { Button, Input, PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import type { Message } from "@/lib/mocks";
import { cn, formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function AlunoChatPage() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.getMessages("c-001").then((r) => setMessages(r.items));
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const m = {
        id: `m-${Date.now()}`,
        senderId: "s-001",
        body: body.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...(prev ?? []), m]);
      setBody("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-[70dvh] flex-col">
      <PageHeader title="Chat" description="Com Ana Souza" />
      <div className="flex-1 space-y-3 overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-surface p-4">
        {!messages ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          messages.map((m) => {
            const mine = m.senderId === "s-001";
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
