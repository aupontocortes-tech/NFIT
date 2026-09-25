"use client";

import { Avatar, Badge, Empty, PageHeader, SkeletonList } from "@/components/ui";
import { api } from "@/lib/api";
import type { Conversation } from "@/lib/mocks";
import { formatDate } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ChatInboxPage() {
  const [items, setItems] = useState<Conversation[] | null>(null);

  useEffect(() => {
    api.listConversations().then((r) => setItems(r.items));
  }, []);

  return (
    <div>
      <PageHeader title="Chat" description="Conversas com alunos" />
      {!items ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <Empty icon={MessageCircle} title="Nenhuma conversa" />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((c) => (
            <li key={c.id}>
              <Link
                href={`/chat/${c.peer.id}`}
                className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 hover:bg-hover"
              >
                <Avatar name={c.peer.name} src={c.peer.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{c.peer.name}</p>
                    {c.unreadCount > 0 ? (
                      <Badge tone="invite">{c.unreadCount}</Badge>
                    ) : null}
                  </div>
                  <p className="truncate text-caption">{c.lastMessage}</p>
                </div>
                <span className="text-caption">{formatDate(c.updatedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
