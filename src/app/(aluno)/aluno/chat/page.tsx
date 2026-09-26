"use client";

import { ChatThread } from "@/components/chat/ChatThread";
import { PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function AlunoChatPage() {
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    api.listStudents({ status: "active" }).then((r) => {
      const saved = localStorage.getItem("nfit_aluno_id");
      const id = r.items.find((s) => s.id === saved)?.id ?? r.items[0]?.id ?? "";
      if (id) localStorage.setItem("nfit_aluno_id", id);
      setStudentId(id);
    });
  }, []);

  return (
    <div className="flex h-[calc(100dvh-10rem)] flex-col">
      <PageHeader title="Chat" description="Com seu personal" />
      {studentId ? <ChatThread conversationId={studentId} myId={studentId} /> : null}
    </div>
  );
}
