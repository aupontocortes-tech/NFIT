"use client";

import { Button, Skeleton } from "@/components/ui";
import { api, MOCK_MESSAGES_PREFIX, USE_MOCK } from "@/lib/api";
import type { Message } from "@/lib/mocks";
import { cn, formatChatTime } from "@/lib/utils";
import { AlertCircle, Check, Clock, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Intervalo de atualização automática. Quando a API tiver WebSocket, dá para trocar. */
const POLL_MS = 4000;

type UiMessage = Message & { status?: "sending" | "failed" };

export function ChatThread({
  conversationId,
  myId,
  emptyText = "Nenhuma mensagem ainda. Diga olá!",
}: {
  conversationId: string;
  /** id de quem está logado — define o lado da bolha. */
  myId: string;
  emptyText?: string;
}) {
  const [messages, setMessages] = useState<UiMessage[] | null>(null);
  const [body, setBody] = useState("");
  const [loadError, setLoadError] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  // Junta mensagens do servidor com as que ainda estão enviando/falharam
  const refresh = useCallback(async () => {
    try {
      const { items } = await api.getMessages(conversationId);
      setLoadError(false);
      setMessages((prev) => {
        const local = (prev ?? []).filter((m) => m.status);
        const serverIds = new Set(items.map((m) => m.id));
        return [...items, ...local.filter((m) => !serverIds.has(m.id))];
      });
    } catch {
      setLoadError(true);
      setMessages((prev) => prev ?? []);
    }
  }, [conversationId]);

  // Carga inicial + atualização automática (pausa quando a aba não está visível)
  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(first);
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  // Modo mock: mensagem enviada em outra aba aparece na hora
  useEffect(() => {
    if (!USE_MOCK) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === MOCK_MESSAGES_PREFIX + conversationId) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [conversationId, refresh]);

  // Rola para a última mensagem (se a pessoa já estava no fim)
  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  async function deliver(tempId: string, text: string) {
    try {
      const saved = await api.sendMessage(conversationId, text, myId);
      setMessages((prev) => (prev ?? []).map((m) => (m.id === tempId ? saved : m)));
    } catch {
      setMessages((prev) =>
        (prev ?? []).map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)),
      );
    }
  }

  function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = body.trim();
    if (!text) return;
    const tempId = `tmp-${Date.now()}`;
    stickToBottom.current = true;
    setMessages((prev) => [
      ...(prev ?? []),
      { id: tempId, senderId: myId, body: text, createdAt: new Date().toISOString(), status: "sending" },
    ]);
    setBody("");
    deliver(tempId, text);
  }

  function retry(m: UiMessage) {
    setMessages((prev) =>
      (prev ?? []).map((x) => (x.id === m.id ? { ...x, status: "sending" } : x)),
    );
    deliver(m.id, m.body);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        onScroll={onScroll}
        aria-live="polite"
        className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-surface p-4"
      >
        {!messages ? (
          <Skeleton className="h-40 w-full" />
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-muted">{emptyText}</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === myId;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-[var(--radius-md)] px-3 py-2 text-sm",
                    mine ? "bg-brand text-text-inverse" : "bg-gray-100 text-text",
                    m.status === "failed" && "bg-red-50 text-error ring-1 ring-error",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 flex items-center justify-end gap-1 text-[10px]",
                      mine && m.status !== "failed" ? "text-white/70" : "text-text-muted",
                    )}
                  >
                    {formatChatTime(m.createdAt)}
                    {mine && m.status === "sending" ? <Clock className="h-3 w-3" /> : null}
                    {mine && !m.status ? <Check className="h-3 w-3" /> : null}
                  </p>
                  {m.status === "failed" ? (
                    <button
                      type="button"
                      onClick={() => retry(m)}
                      className="mt-1 flex items-center gap-1 text-xs font-medium underline"
                    >
                      <AlertCircle className="h-3 w-3" /> Não enviou — tentar de novo
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
      {loadError ? (
        <p className="mt-2 text-xs text-error">Sem conexão. Tentando de novo…</p>
      ) : null}
      <form onSubmit={send} className="mt-3 flex items-end gap-2">
        <textarea
          aria-label="Mensagem"
          placeholder="Mensagem"
          rows={1}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            // Enter envia, Shift+Enter quebra linha
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-base text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
        />
        <Button type="submit" disabled={!body.trim()} aria-label="Enviar">
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Enviar</span>
        </Button>
      </form>
    </div>
  );
}
